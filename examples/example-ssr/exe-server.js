"use strict"
const express = require("express")
const port = "1234"
const app = express()

const { prerender } = require("./prerender.js")

app.get("/generate", prerender)
app.listen(port, () => {
  console.log(`Exe server is running pn ${port}.`)
})

