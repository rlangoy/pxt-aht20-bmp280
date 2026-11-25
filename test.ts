AHT20.initialize()
BMP280.initialize()

basic.forever(function () {
    if (AHT20.readSensor()) {
        serial.writeValue("AHT20 C", AHT20.temperature())
        serial.writeValue("humidity %", AHT20.humidity())
    } else {
        serial.writeLine("AHT20 read failed")
    }
    if (BMP280.readSensor()) {
        serial.writeValue("BMP280 C", BMP280.temperature())
    } else {
        serial.writeLine("BMP280 read failed")
    }
    basic.pause(2000)
})
