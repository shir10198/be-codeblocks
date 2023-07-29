const mongoose = require('mongoose');

const codeBlockSchema = new mongoose.Schema({
    id: Number,
    title: String,
    code: String,
});

const CodeBlock = mongoose.model('CodeBlock', codeBlockSchema);

module.exports = CodeBlock;
  