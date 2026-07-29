import fs from "fs";
import path from "path";

// -- getAdminLogs
export const getAdminLogs = async (req, res, next) => {
  try {
    const logPath = path.resolve("logs", "admin-actions.log");

    if (!fs.existsSync(logPath)) {
      return res.status(200).json([]);
    }

    const fileContent = fs.readFileSync(logPath, "utf-8");
    const lines = fileContent
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const formattedLogs = [];

    for (let i = 0; i < lines.length; i += 3) {
      if (lines[i]) {
        formattedLogs.push({
          action: lines[i] || "",
          admin: lines[i + 1] || "",
          target: lines[i + 2] || "",
        });
      }
    }

    res.status(200).json(formattedLogs.reverse());
  } catch (error) {
    next(error);
  }
};
