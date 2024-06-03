// pages/api/download.js
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs/promises";

const prisma = new PrismaClient();

const handler = async (req, res) => {
  const { uid } = req.query;

  if (!uid) {
    res.status(400).json({ error: "UID is required" });
    return;
  }

  try {
    const file = await prisma.file.findUnique({
      where: { uid },
    });

    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    const filePath = file.path;

    // Check if the file exists
    const fileExists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      res.status(404).json({ error: "File not found on server" });
      return;
    }

    const fileContent = await fs.readFile(filePath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${uid}.pdf"`);
    res.status(200).send(fileContent);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default handler;
