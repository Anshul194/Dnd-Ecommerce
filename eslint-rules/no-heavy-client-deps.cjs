module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Warn when large/heavy client-side libraries are statically imported in client code. Prefer dynamic import().",
      recommended: false,
    },
    schema: [],
    messages: {
      avoid:
        "Static import of '{{name}}' in client code may inflate bundles. Prefer dynamic import() or code-splitting.",
    },
  },
  create(context) {
    const heavyLibs = new Set([
      "swiper",
      "xlsx",
      "react-calendly",
      "react-calendly/dist",
      "react-calendly/lib",
      "xlsx/dist",
    ]);

    function isServerPath(filename) {
      if (!filename || filename === "<input>") return false;
      const f = filename.replace(/\\\\/g, "/");
      const allowed = [
        "/src/app/api/",
        "/src/pages/api/",
        "/src/server/",
        "/server/",
        "/src/lib/server/",
      ];
      return allowed.some((a) => f.includes(a));
    }

    function checkPackage(pkg, node) {
      if (!pkg) return;
      // exact match or startsWith for subpaths
      for (const h of heavyLibs) {
        if (pkg === h || pkg.startsWith(h + "/")) {
          const filename = context.getFilename();
          if (isServerPath(filename)) return;
          context.report({ node, messageId: "avoid", data: { name: pkg } });
          return;
        }
      }
    }

    return {
      ImportDeclaration(node) {
        const pkg = node.source && node.source.value;
        checkPackage(pkg, node.source);
      },

      CallExpression(node) {
        // catch require('pkg') calls
        if (
          node.callee &&
          node.callee.type === "Identifier" &&
          node.callee.name === "require" &&
          node.arguments &&
          node.arguments[0] &&
          (node.arguments[0].type === "Literal" ||
            node.arguments[0].type === "StringLiteral")
        ) {
          const pkg = node.arguments[0].value;
          checkPackage(pkg, node.arguments[0]);
        }
      },
    };
  },
};
