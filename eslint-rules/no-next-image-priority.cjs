module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Warn when `priority` prop is used on `next/image`. Reserve for hero images.",
      recommended: false,
    },
    schema: [],
    messages: {
      avoid:
        "Avoid using `priority` on `next/image`. Reserve it for single above-the-fold hero images only.",
    },
  },
  create(context) {
    const imageLocalNames = new Set();

    return {
      ImportDeclaration(node) {
        if (node.source && node.source.value === "next/image") {
          for (const spec of node.specifiers || []) {
            if (spec.local && spec.local.name) {
              imageLocalNames.add(spec.local.name);
            }
          }
        }
      },

      JSXOpeningElement(node) {
        const nameNode = node.name;
        let name = null;
        if (!nameNode) return;
        if (nameNode.type === "JSXIdentifier") {
          name = nameNode.name;
        } else if (nameNode.type === "JSXMemberExpression") {
          // handle <Foo.Image /> style (unlikely for next/image)
          if (nameNode.object && nameNode.object.name)
            name = nameNode.object.name;
        }

        if (!name) return;
        if (!imageLocalNames.has(name)) return;

        for (const attr of node.attributes || []) {
          if (
            attr &&
            attr.type === "JSXAttribute" &&
            attr.name &&
            attr.name.name === "priority"
          ) {
            context.report({ node: attr, messageId: "avoid" });
          }
        }
      },
    };
  },
};
