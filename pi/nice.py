
import drivers
import time
import keyboard
import pymongo

display = drivers.Lcd()

isbn = [" " for i in range(20)]
cursor = -1
is_accepting_input = True


def long_string(display, text='', num_line=1, num_cols=20):
    """ 
    Parameters: (driver, string to print, number of line to print, number of columns of your display)
    Return: This function send to display your scrolling string.
    """
    if len(text) > num_cols:
        display.lcd_display_string(text[:num_cols], num_line)
        time.sleep(1)
        for i in range(len(text) - num_cols + 1):
            text_to_print = text[i:i+num_cols]
            display.lcd_display_string(text_to_print, num_line)
            time.sleep(0.2)
        time.sleep(1)
    else:
        display.lcd_display_string(text, num_line)


def on_key_pressed(key):
    global isbn, cursor
    if is_accepting_input:
        if cursor < len(isbn) - 1:
            cursor += 1
            isbn[cursor] = key
        display.lcd_display_string(isbn, 2)


def backspace(e):
    global isbn, cursor
    if is_accepting_input:
        if cursor >= 0:
            isbn[cursor] = ' '
            cursor -= 1
        display.lcd_display_string(isbn, 2)


def submit(e):
    global is_accepting_input
    is_accepting_input = False
    time.sleep(0.5)
    display.lcd_clear()
    display.lcd_display_string("Querying...", 1)

    client = pymongo.MongoClient("mongodb://192.168.1.4:27017")

    db = client["library"]
    col = db["book"]

    item = col.find_one({"isbn": "".join(isbn).strip()})

    if item:
        display.lcd_display_string(item["author"], 2)
        display.lcd_display_string(str(item["pages"])+" pages", 3)
        display.lcd_display_string(item["publisher"], 4)
        long_string(display, item["title"], 1)
    else:
        display.lcd_display_string("Not found!", 1)

    time.sleep(3)
    display.lcd_backlight(0)


def ISBN_query(e):
    keyboard.unhook_all()
    display.lcd_clear()
    keyboard.on_press_key("0", lambda _: on_key_pressed("0"))
    keyboard.on_press_key("1", lambda _: on_key_pressed("1"))
    keyboard.on_press_key("2", lambda _: on_key_pressed("2"))
    keyboard.on_press_key("3", lambda _: on_key_pressed("3"))
    keyboard.on_press_key("4", lambda _: on_key_pressed("4"))
    keyboard.on_press_key("5", lambda _: on_key_pressed("5"))
    keyboard.on_press_key("6", lambda _: on_key_pressed("6"))
    keyboard.on_press_key("7", lambda _: on_key_pressed("7"))
    keyboard.on_press_key("8", lambda _: on_key_pressed("8"))
    keyboard.on_press_key("9", lambda _: on_key_pressed("9"))
    keyboard.on_press_key("backspace", backspace)
    keyboard.on_press_key("enter", submit)

    display.lcd_display_string("Enter book ISBN:", 1)


display.lcd_display_string("(1) Search Book", 1)
display.lcd_display_string("(2) Browse Database", 2)
display.lcd_display_string("(3) Edit Data", 3)
display.lcd_display_string("(4) Exit", 4)

keyboard.on_press_key("1", ISBN_query)

try:
    input()
    input()

except KeyboardInterrupt:
    display.lcd_clear()
