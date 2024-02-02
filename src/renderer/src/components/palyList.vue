<template>
  <el-tree :data="items" node-key="path" default-expand-all>
    <template #default="{ data }">
      <div :class="{ active: cVideo?.path === data.path }" @click="play(data)">{{ data.name }}</div>
    </template>
    <template #empty>
      <a href="javascript:;" class="file">拖拽文件到此
        <input type="file" name="" id="">
      </a>
    </template>
  </el-tree>
</template>

<script lang="ts" setup>
// import { ref } from 'vue';
defineProps<{
  items: any,
  cVideo: any
}>()

const emits = defineEmits(["play"])

const play = (item: any) => {
  if (!item.type) {
    return
  }
  emits('play', item)
}

</script>

<style scoped>
div {
  font-size: 10px;
  /* color:  black; */
  line-height: 26px;
  flex-grow: 1;

  &.active {
    color: green;
    font-weight: bolder;
  }
}

/*a  upload */
.a-upload {
  padding: 4px 10px;
  height: 20px;
  line-height: 20px;
  position: relative;
  cursor: pointer;
  color: #888;
  background: #fafafa;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  display: inline-block;
}

.a-upload input {
  position: absolute;
  font-size: 100px;
  right: 0;
  top: 0;
  opacity: 0;
  filter: alpha(opacity=0);
  cursor: pointer
}

.a-upload:hover {
  color: #444;
  background: #eee;
  border-color: #ccc;
  text-decoration: none
}

.file {
  position: relative;
  display: inline-block;
  background: #D0EEFF;
  border: 1px solid #99D3F5;
  border-radius: 4px;
  padding: 40px 40px;
  overflow: hidden;
  color: #1E88C7;
  text-decoration: none;
  text-indent: 0;
  line-height: 20px;
}

.file input {
  position: absolute;
  font-size: 100px;
  right: 0;
  top: 0;
  opacity: 0;
}

.file:hover {
  background: #AADFFD;
  border-color: #78C3F3;
  color: #004974;
  text-decoration: none;
}
</style>