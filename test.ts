AHT20.initialize()
BMP280.initialize()

basic.forever(function () {
    serial.writeValue("AHT20 C", AHT20.temperature())
    serial.writeValue("humidity %", AHT20.humidity())
    serial.writeValue("BMP280 C", BMP280.temperature())
    basic.pause(2000)
})
