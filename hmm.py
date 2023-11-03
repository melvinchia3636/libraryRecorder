from selenium import webdriver

options = webdriver.FirefoxOptions()
options.add_argument(
    '--profile')
options.add_argument(
    "/Users/melvinchia/Library/Application Support/Firefox/Profiles/pxenk4di.default-release")

driver = webdriver.Firefox(options=options)
