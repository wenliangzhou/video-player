<script setup lang="ts">
import { onMounted, ref } from "vue";
import palyList from './components/palyList.vue'
import { ElMessage } from 'element-plus'

const fs = window.require('fs')
const path = window.require('path')

const list = ref<any[]>([])
const video = ref()
const videosrc = ref()


// function getMp4File(item) {
//   const buf = fs.readFileSync(item)
//   const uint8Buffer = Uint8Array.from(buf)
//   const bolb = new Blob([uint8Buffer])
//   return window.URL.createObjectURL(bolb);
// }

const getDirFilePath = (dirPath: any) => {
  return new Promise((resove, reject) => {
    let res: any = []
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        console.error('Error reading folder:', err);
        reject([])
        return;
      }
      // 遍历文件数组
      let ps: any = []
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        console.log(file);
        // 检查文件是否为普通文件
        ps.push(new Promise((r: any) => {
          fs.stat(filePath, async (statErr, stats) => {
            if (statErr) {
              console.error('Error getting file stats:', statErr);
              return;
            }

            if (stats.isFile()) {
              // 在这里处理文件
              res.push({
                name: file,
                type: 'video/mp4',
                path: filePath,
                children: []
              });
              // 如果需要读取文件内容，可以使用 fs.readFile(filePath, 'utf8', (readErr, data) => {...});
            } else {
              res.push({
                name: file,
                type: '',
                path: filePath,
                children: await getDirFilePath(filePath)
              });
            }
            r()
          });
        }))
      });
      Promise.all(ps).then(() => {
        resove(res)
      })
    });
  })
}
const getList = async (files: any) => {
  let res: any = [];
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    let children: any = []
    if (!file.type) {
      // 读取文件夹中的文件
      let dirPath = file.path;
      // 获取path文件下的files
      children = await getDirFilePath(dirPath)
    }
    res.push({
      name: file.name,
      type: file.type,
      path: file.path,
      children: children
    });
  }
  return res;
}



const play = (e) => {
  videosrc.value = e.path
  cVideo.value = e;
  console.log(e, '222222222');
}
const cVideo = ref()
const playVideo = (type: string) => {
  if (!cVideo.value) {
    ElMessage('this is a message.')
    return
  }
  let video = searchVideo(type, cVideo.value.$treeNodeId)
  play(video)
}

const flatList = (arr) => {
  let res: any[] = []
  arr.map(item => {
    if (item.type) {
      res.push(item)
    }
    if (item.children) {
      res.push(...flatList(item.children))
    }
  })
  return res;
}

const searchVideo = (type, id) => {
  let arr = flatList(list.value);
  let index = arr.findIndex(item => {
    return item.$treeNodeId === id;
  })
  if (type === 'next') {
    if (index + 1 === arr.length) {
      ElMessage('已经是最后一个')
    }
    return arr[index + 1]
  }
  if (type === 'pre') {
    if (index - 1 === -1) {
      ElMessage('已经是第一个')
    }
    return arr[index - 1]
  }
}

onMounted(() => {
  // Handle file drop event
  document.body.addEventListener('drop', function (event: any) {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    console.log(event, files);
    getList(files).then((x) => {
      console.log(x, '111111111111111111111122222');
      list.value = x
    })
  });


})


// const ipcHandle = () => window.electron.ipcRenderer.send('ping')
const drawer = ref(false)
const min = () => window.electron.ipcRenderer.send('window-min')
const max = () => window.electron.ipcRenderer.send('window-max')
const close = () => window.electron.ipcRenderer.send('window-close')
</script>

<template>
  <div class="wrap">
    <video id="my-video" ref="video" class="video" :src="videosrc" autoplay controls preload="auto"></video>


    <el-drawer v-model="drawer" :with-header="false">
      <div class="play-list">
        <div class="title">播放列表</div>
        <palyList :items="list" @play="play" :cVideo="cVideo"></palyList>
      </div>
    </el-drawer>
    <div class="bar">
      <el-button-group>
        <el-button size="small" v-if="cVideo" :icon="'ArrowLeft'" @click="playVideo('pre')"></el-button>
        <el-button size="small" v-if="cVideo" :icon="'ArrowRight'" @click="playVideo('next')"></el-button>
        <el-button size="small" @click="drawer = true">播放列表</el-button>
        <el-button size="small" @click="list = []">清空播放列表</el-button>
        <el-button size="small" :icon="'Minus'" @click="min"></el-button>
        <el-button size="small" :icon="'Plus'" @click="max"></el-button>
        <el-button size="small" :icon="'Close'" @click="close"></el-button>
        <el-button size="small" :icon="'Rank'" class="drag"></el-button>
      </el-button-group>
    </div>
  </div>
</template>
<style>
.el-drawer {
  --el-drawer-padding-primary: 10px;
}
</style>
<style lang="less">
* {
  padding: 0;
  margin: 0;
}

.title {
  font-size: 12px;
  font-family: '微软雅黑';
  margin-bottom: 10px;
}

video {
  display: block;
  width: 100%;
  height: 100vh;
}

.bar {
  // display: none;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.wrap {
  height: 100vh;
  &:hover {
    .bar {
      // display: block;
      opacity: 1;
    }
  }
}

.drag {
  position: absolute;
  top: 0;
  right: 0;
  -webkit-app-region: drag;

  i {
    -webkit-app-region: drag;

    svg {
      -webkit-app-region: drag;
    }
  }
}
</style>
