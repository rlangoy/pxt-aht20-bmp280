/** Blocks for the AHT20 temperature and humidity sensor. */
//% color="#1685A9" icon="\uf2c9" block="AHT20"
namespace AHT20 {
    const address = 0x38
    let initialized = false
    let temperatureValue = 0
    let humidityValue = 0

    function command(a: number, b: number, c: number): void {
        let buffer = pins.createBuffer(3)
        buffer[0] = a
        buffer[1] = b
        buffer[2] = c
        pins.i2cWriteBuffer(address, buffer)
    }

    /** Initialize the sensor. Returns false if calibration is not confirmed. */
    //% block="initialize AHT20" blockHidden=true
    export function initialize(): boolean {
        basic.pause(200)
        let status = pins.i2cReadBuffer(address, 1)
        if (status.length < 1) return false
        if ((status[0] & 0x08) == 0) {
            command(0xBE, 0x08, 0x00)
            basic.pause(20)
            status = pins.i2cReadBuffer(address, 1)
        }
        // 0xFF is a common result when no device responds; it is not a valid status.
        initialized = status.length > 0 && status[0] != 0xFF && (status[0] & 0x08) != 0
        return initialized
    }

    /** Initialize the AHT20 temperature and humidity sensor. */
    //% block="initialize AHT20" weight=100 blockAliasFor="AHT20.initialize"
    export function _initializeStatement(): void {
        initialize()
    }

    /** Take a measurement and update both values. Returns false on failure. */
    //% block="read AHT20 sensor" weight=90
    export function readSensor(): boolean {
        if (!initialized && !initialize()) return false
        command(0xAC, 0x33, 0x00)
        basic.pause(80)
        for (let attempt = 0; attempt < 10; attempt++) {
            let data = pins.i2cReadBuffer(address, 6)
            if (data.length == 6 && (data[0] & 0x80) == 0) {
                let rawHumidity = (data[1] << 12) | (data[2] << 4) | (data[3] >> 4)
                let rawTemperature = ((data[3] & 0x0F) << 16) | (data[4] << 8) | data[5]
                humidityValue = rawHumidity * 100 / 1048576
                temperatureValue = rawTemperature * 200 / 1048576 - 50
                return true
            }
            basic.pause(20)
        }
        initialized = false
        return false
    }

    /** Temperature from the last successful measurement, in degrees Celsius. */
    //% block="AHT20 temperature (°C)" weight=80
    export function temperature(): number {
        return temperatureValue
    }

    /** Relative humidity from the last successful measurement, in percent. */
    //% block="AHT20 humidity (%%)" weight=70
    export function humidity(): number {
        return humidityValue
    }
}
