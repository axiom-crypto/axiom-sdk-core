const fs = require('fs');


const convertDocs = () => {
    const docString = fs.readFileSync('src/v2/circuit/docs/axiomDocs.d.ts', 'utf8');
    const filteredDocString = docString
        .split('\n')
        .filter(line => !line.trim().startsWith('import'))
        .join('\n')
        .replaceAll("export ", "");

    const exportedDocString = `export const axiomDocs = ${JSON.stringify(filteredDocString)};`;
    fs.writeFileSync('src/v2/circuit/docs/axiomDocs.ts', exportedDocString);
}

if (require.main === module) {
    convertDocs();
}

module.exports = convertDocs;