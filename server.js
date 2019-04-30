import express from 'express'
import bodyParser from 'body-parser'
import socketIO from 'socket.io'
import SerialPort from 'serialport'

// var myPort = new SerialPort('COM21', 9600) // open the port
// var Readline = SerialPort.parsers.Readline // make instance of Readline parser
// var parser = new Readline() // make a new parser to read ASCII lines
// myPort.pipe(parser) // pipe the serial stream to the parser

const server = express()
const port = process.env.PORT | 9000

// these are the definitions for the serial events:
// myPort.on('open', showPortOpen) // called when the serial port opens
// myPort.on('close', showPortClose) // called when the serial port closes
// myPort.on('error', showError) // called when there's an error with the serial port
// parser.on('data', readSerialData) // called when there's new data incoming

// ------------------------ Serial event functions:
// this is called when the serial port is opened:
function showPortOpen() {
  console.log('port open. Data rate: ' + myPort.baudRate)
}

// this is called when new data comes into the serial port:
function readSerialData(data) {
  // if there are webSocket connections, send the serial data
  // to all of them:
  console.log(data)
  io.sockets.emit('new-message', data)
}

function showPortClose() {
  console.log('port closed.')
}
// this is called when the serial port has an error:
function showError(error) {
  console.log('Serial port error: ' + error)
}

function sendToSerial(data) {
  console.log('sending to serial: ' + data)
  myPort.write(data)
}

server.use(bodyParser.json())
server.use(
  bodyParser.urlencoded({
    extended: true
  })
)

const app = server.listen(port, function(err, result) {
  console.log('running in port http://localhost:' + port)
})

const io = socketIO.listen(app)
// รอการ connect จาก client
io.on('connection', client => {
  console.log('user connected')

  // เมื่อ Client ตัดการเชื่อมต่อ
  client.on('disconnect', () => {
    console.log('user disconnected')
  })

  //ส่งข้อมูลไปยัง Client ทุกตัวที่เขื่อมต่อแบบ Realtime
  client.on('sent-message', function(message) {
    io.sockets.emit('new-message', message)
  })

  client.on('sent-command', sendToSerial)
})

export default server
