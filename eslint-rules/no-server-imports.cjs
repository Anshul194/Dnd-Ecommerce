module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow importing server-only packages from client code (helps prevent client bundle pollution).",
      recommended: false,
    },
    schema: [],
    messages: {
      avoid:
        "Importing '{{name}}' in client code may leak server-only modules into client bundles.",
    },
  },
  create(context) {
    const serverPackages = new Set([
      "mongoose",
      "mongodb",
      "googleapis",
      "ioredis",
      "bcrypt",
      "bcryptjs",
      "multer",
      "stripe",
      "google",
    ]);

    function isServerPath(filename) {
      if (!filename || filename === "<input>") return false;
      const f = filename.replace(/\\\\/g, "/");
      // allow server-side folders
      const allowed = [
        "/src/app/api/",
        "/src/pages/api/",
        "/src/server/",
        "/server/",
        "/src/lib/server/",
      ];
      return allowed.some((a) => f.includes(a));
    }

    function reportImport(node, pkg) {
      context.report({ node, messageId: "avoid", data: { name: pkg } });
    }

    return {
      ImportDeclaration(node) {
        const pkg = node.source && node.source.value;
        if (!pkg) return;

        if (!serverPackages.has(pkg)) return;

        const filename = context.getFilename();
        if (isServerPath(filename)) return; // allowed in server files

        reportImport(node.source, pkg);
      },

      CallExpression(node) {
        // catch require('pkg') calls
        if (
          node.callee &&
          node.callee.type === "Identifier" &&
          node.callee.name === "require" &&
          node.arguments &&
          node.arguments[0] &&
          node.arguments[0].type === "Literal"
        ) {
          const pkg = node.arguments[0].value;
          if (serverPackages.has(pkg)) {
            const filename = context.getFilename();
            if (isServerPath(filename)) return;
            reportImport(node.arguments[0], pkg);
          }
        }
      },
    };
  },
};
