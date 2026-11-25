# AHT20 and BMP280 for micro:bit MakeCode

Blocks for an AHT20 temperature/humidity sensor and BMP280 temperature sensor. The BMP280 code implements temperature only, like the supplied MicroPython example. Pressure is not implemented.

## Wiring

Connect both sensors to the same I²C bus:

| Sensor pin | micro:bit |
| --- | --- |
| VCC / VIN | 3V |
| GND | GND |
| SDA | P20 |
| SCL | P19 |

Use 3.3 V-compatible breakout boards. I²C needs pull-ups to 3.3 V; breakout boards often include them. Check your hardware documentation.

AHT20 uses address 0x38. BMP280 is detected at 0x76 or 0x77 and must report chip ID 0x58; a BME280 is not supported.

## Blocks

Each sensor has its own category. `initialize` is optional: the first `read sensor` initializes automatically. `read sensor` returns true on success and updates the values. Read the temperature or humidity block only after a successful read. Values initially equal zero and retain their last successful reading on failure. Wait at least two seconds between AHT20 readings.

The BMP280 reads its individual temperature calibration values and uses the floating-point compensation formula. MakeCode's I²C interface does not expose a reliable device-presence scan or all bus errors, so the return values cannot guarantee detection of every wiring fault. I²C does not work in the simulator.

## Example

```typescript
basic.forever(function () {
    if (AHT20.readSensor()) {
        serial.writeValue("AHT20 C", AHT20.temperature())
        serial.writeValue("humidity %", AHT20.humidity())
    }
    if (BMP280.readSensor()) {
        serial.writeValue("BMP280 C", BMP280.temperature())
    }
    basic.pause(2000)
})
```

## Installation

Create a public GitHub repository, for example `pxt-aht20-bmp280`, and upload the contents of this folder to its root. In https://makecode.microbit.org/ select **Extensions**, paste the repository URL and add the extension. Download to a real micro:bit and use the serial console to view results.

For gallery approval see https://makecode.microbit.org/extensions/approval. Add an MIT LICENSE and complete the other approval requirements if you wish to submit the extension. Check the rights to any third-party code before licensing it.
