const { chromium } = require('playwright')
const chai = require('chai')
const expect = chai.expect

describe('Test', () => {
  let browser, context

  before(async () => {
    browser = await chromium.launch()
    context = await browser.newContext()
  })

  after(async () => {
    await browser.close()
  })

  it('checks the title of the page', async () => {
    const page = await context.newPage();
    await page.goto('https://www.tilfin.com/')
    const title = await page.title()
    expect(title).to.equal('Home | Tilfin Ltd.')
  })
})
