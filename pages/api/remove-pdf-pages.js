import { filesRepo } from "../../helpers/files-repo.js";
const formidable = require("formidable");
const path = require("path");
const fsPromises = require("fs/promises");
const fs = require("fs");
import { v4 as uuidv4 } from "uuid";

import { PDFDocument } from "pdf-lib";
import { support } from "@/utiils/file-repo.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handler = async (req, res) => {
  const contentType = req.headers["content-type"];
  if (contentType && contentType.indexOf("multipart/form-data") !== -1) {
    const form = formidable({ maxFileSize: 5120 * 1024 * 1024 }); //Max file size is set to 5GB

    const result = await new Promise(function (resolve, reject) {
      form.parse(req, function (err, fields, files) {
        if (err) {
          reject(err);
        }
        resolve({ files, fields });
      });
    });

    //check if ann error occured while parcing the form
    if (!result.files || !result.fields) {
      res
        .status(400)
        .json({ error: "An error occured while parsing the form data" });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileKeys = Object.keys(result.files);

    const reqPages = result.fields.pages;
    const pagesArray = reqPages.split(",");
    const pages = pagesArray.map(Number).reverse();

    console.log("pages", pages);

    const fileProcessingPromises = fileKeys.map(async (fileKey) => {
      const file = result.files[fileKey];
      const id = uuidv4();
      const filePath = path.join(uploadDir, `${id}.pdf`);

      await fsPromises.copyFile(file.filepath, filePath);

      const removePageFilePath = path.join(uploadDir, `${id}_removePage.pdf`);
      const command = `gs -sDEVICE=pdfwrite -o ${removePageFilePath} ${filePath}`;
      await support.runCommand(command);

      const existingPdfBytes = await fsPromises.readFile(removePageFilePath);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      for (let index = 0; index < pages.length; index++) {
        pdfDoc.removePage(pages[index]);
      }

      const pdfBytes = await pdfDoc.save();

      await prisma.file.create({
        data: {
          uid: id,
          path: removePageFilePath,
        },
      });
      await fsPromises.unlink(filePath);
      await fsPromises.writeFile(removePageFilePath, pdfBytes);

      return id;
    });

    try {
      const uid = await Promise.all(fileProcessingPromises);
      res.status(200).json({ uid: uid[0] });
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while processing the files" });
    }
  } else {
    res.status(400).json({ error: "Wrong content-type" });
  }
};

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export default handler;
