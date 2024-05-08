import express from 'express'
import cors from 'cors'
import {v4 as uuid} from 'uuid'
import multer from 'multer'
import {exec} from 'child_process'
import fs from 'fs'
import path from 'path'
import { error } from 'console'
import { stderr, stdout } from 'process'

const app = express()

app.use(cors({
    origin:['http://localhost:3000/'],
    credentials:true
}))

// This middleware is helping us set or check content type
app.use((req,res,next)=>{
req.header('Access-Allow-Origin',"*")
req.header('Access-Allow-Headers',
    "Origin, X-Requested-With, Content-Type, Accept "
)
next()
})

app.use(express.json())

const storage = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null, './uploads')
    },
    filename:(req, file, cb)=>{
        cb(null, uuid()+path.extname(file.originalname))
    }
})

const upload = multer({storage:storage})

app.get('/',(req,res)=>{
    res.status(200).send({message:"Hello server start ho gya"})
})

app.post('/postvideo', upload.single('file'),(req,res)=>{
 const lessionId = uuid()
 const VideoPath = req.file.path
 const OutputPath = `./uploads/courses/${lessionId}`
 const hlspath = `${OutputPath}/index.m3u8`

 if(!fs.existsSync(OutputPath)){
    fs.mkdirSync(OutputPath,{recursive:true})
 }


//  const ffmpegCommand = `ffmpeg -i 
//  ${VideoPath} -codec:v libx264 -codec:a 
//  aac -hls_time 10 -hls_playlist_type vod
//   -hls_segment_filename "${OutputPath}/segment%03d.ts" 
//   -start_number 0 ${hlspath}`;

const ffmpegCommand = `ffmpeg -i ${VideoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename ${OutputPath}/segment%03d.ts -start_number 0 ${hlspath}`

  exec(ffmpegCommand,(error,stdout,stderr)=>{
    if (error) {
        console.log(`error: ${error.message}`);
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);
    const VideoUrl=`http//localhost:8080/courses/${lessionId}/index.m3u8`
    res.status(200).json({
        message:"Video converted in HLS format successfully",
        VideoPath:VideoUrl,
    lessionId:lessionId
    })
  })
})



app.listen(3000,()=>console.log('Server started on the port 8080'))

