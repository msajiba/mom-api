// pages/api/upload.js
import { filesRepo } from "../../helpers/files-repo.js";
const formidable = require("formidable");
const path = require("path");
const fsPromises = require("fs/promises");
const fs = require("fs");
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import { support } from "@/utiils/file-repo.js";

const prisma = new PrismaClient();

const handler = async (req, res) => {
  const contentType = req.headers["content-type"];
  if (contentType && contentType.indexOf("multipart/form-data") !== -1) {
    const form = formidable({ multiples: true });

    const result = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(err);
        }
        resolve({ files, fields });
      });
    });

    if (!result.files || !result.fields) {
      res
        .status(400)
        .json({ error: "An error occurred while parsing the form data" });
      return;
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileKeys = Object.keys(result.files);

    const fileProcessingPromises = fileKeys.map(async (fileKey) => {
      const file = result.files[fileKey];
      const id = uuidv4();
      const filePath = path.join(uploadDir, `${id}.pdf`);

      await fsPromises.copyFile(file.filepath, filePath);

      // Compress PDF using Ghostscript
      const compressedFilePath = path.join(uploadDir, `${id}_compressed.pdf`);
      const command = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -sOutputFile=${compressedFilePath} ${filePath}`;
      await support.runCommand(command);

      // Save file path to database
      await prisma.file.create({
        data: {
          uid: id,
          path: compressedFilePath,
        },
      });

      // Delete original file after compression
      await fsPromises.unlink(filePath);

      return id;
    });

    try {
      const uid = await Promise.all(fileProcessingPromises);
      res.status(200).json({ uid });
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
