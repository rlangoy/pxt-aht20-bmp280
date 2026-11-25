/** BMP280 temperature sensor. */
//% color="#8061AD" icon="\uf2c9" block="BMP280"
namespace BMP280 {
    let address = 0
    let t1 = 0
    let t2 = 0
    let t3 = 0
    let temperatureValue = 0

    function readRegisters(addr: number, register: number, count: number): Buffer {
        pins.i2cWriteNumber(addr, register, NumberFormat.UInt8BE, true)
        return pins.i2cReadBuffer(addr, count)
    }

    function signed16(lo: number, hi: number): number {
        let value = lo | (hi << 8)
        if (value >= 32768) value -= 65536
        return value
    }

    /** Find the BMP280 and read its temperature calibration data. */
    //% block="initialize BMP280" weight=100
    export function initialize(): boolean {
        address = 0
        for (let candidate = 0x76; candidate <= 0x77; candidate++) {
            let id = readRegisters(candidate, 0xD0, 1)
            if (id.length == 1 && id[0] == 0x58) {
                address = candidate
                break
            }
        }
        if (address == 0) return false
        let cal = readRegisters(address, 0x88, 6)
        if (cal.length != 6) {
            address = 0
            return false
        }
        t1 = cal[0] | (cal[1] << 8)
        t2 = signed16(cal[2], cal[3])
        t3 = signed16(cal[4], cal[5])
        let config = pins.createBuffer(2)
        config[0] = 0xF4
        config[1] = 0x23
        pins.i2cWriteBuffer(address, config)
        basic.pause(100)
        return true
    }

    /** Read and compensate the temperature. Returns false when the sensor cannot be read. */
    //% block="read BMP280 sensor" weight=90
    export function readSensor(): boolean {
        if (address == 0 && !initialize()) return false
        let data = readRegisters(address, 0xFA, 3)
        if (data.length != 3) {
            address = 0
            return false
        }
        let adc = (data[0] << 12) | (data[1] << 4) | (data[2] >> 4)
        if (adc == 0x80000) return false
        // Floating-point form avoids the 32-bit overflow of intermediate bit shifts.
        let var1 = (adc / 16384 - t1 / 1024) * t2
        let delta = adc / 131072 - t1 / 8192
        let var2 = delta * delta * t3
        temperatureValue = (var1 + var2) / 5120
        return true
    }

    /** Temperature from the last successful measurement in degrees Celsius. */
    //% block="BMP280 temperature (°C)" weight=80
    export function temperature(): number {
        return temperatureValue
    }
}
