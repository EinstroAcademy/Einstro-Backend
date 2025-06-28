const express = require('express');
const { updateSubjectAndBranch } = require('../../controller/query/query');
const queryRouter = express.Router()

queryRouter.post('/query/update/subject/branch',updateSubjectAndBranch)

module.exports = queryRouter
