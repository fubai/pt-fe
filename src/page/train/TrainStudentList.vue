<template>
  <div>
    <div class="info">
      <label>上课时间:</label>
      <span>{{`${training.startTime.substring(0, 16)} ~ ${training.endTime.substring(10, 16)}`}}</span>
      <label>课程:</label>
      <span>{{training.courseName}}</span>
      <label>老师:</label>
      <span>{{training.teacherName}}</span>
      <label>班级:</label>
      <span>{{training.fullClazzName}}</span>
      <label>完课情况:</label>
      <span>{{`${(training.courseItemPositions || []).length} / ${training.courseItemCount || 0}`}}</span>
    </div>
    <el-table v-loading="loading" :data="stats" :stripe="true" size="mini" border @row-click="openDrawer" :row-style="{ cursor: 'pointer' }">
      <el-table-column type="index" label="序号" fixed="left"></el-table-column>
      <el-table-column prop="studentName" label="学生" fixed="left"></el-table-column>
      <el-table-column prop="avgHeartRate" label="平均心率" width="95px" sortable></el-table-column>
      <el-table-column prop="maxHeartRate" label="最大心率" width="95px" sortable></el-table-column>
      <el-table-column prop="minHeartRate" label="最小心率" width="95px" sortable></el-table-column>
      <el-table-column prop="avgDiastolicPressure" label="平均舒张压" width="105px" sortable></el-table-column>
      <el-table-column prop="maxDiastolicPressure" label="最大舒张压" width="105px" sortable></el-table-column>
      <el-table-column prop="minDiastolicPressure" label="最小舒张压" width="105px" sortable></el-table-column>
      <el-table-column prop="avgSystolicPressure" label="平均收缩压" width="105px" sortable></el-table-column>
      <el-table-column prop="maxSystolicPressure" label="最大收缩压" width="105px" sortable></el-table-column>
      <el-table-column prop="minSystolicPressure" label="最小收缩压" width="105px" sortable></el-table-column>
      <el-table-column prop="avgBloodOxygen" label="平均血氧" width="95px" sortable></el-table-column>
      <el-table-column prop="maxBloodOxygen" label="最大血氧" width="95px" sortable></el-table-column>
      <el-table-column prop="minBloodOxygen" label="最小血氧" width="95px" sortable></el-table-column>
      <el-table-column prop="stepCount" label="步数" width="70px" sortable></el-table-column>
      <el-table-column prop="distance" label="运动距离" width="95px" sortable></el-table-column>
      <el-table-column prop="calorie" label="卡路里" width="85px" sortable></el-table-column>
      <el-table-column prop="duration" label="运动量" width="85px" sortable></el-table-column>
    </el-table>
    <student-train-drawer ref="studentTrainDrawer"></student-train-drawer>
  </div>
</template>

<script>
export default {
  name: 'train-student-list',
  props: {
    training: {type: Object, require: true}
  },
  data () {
    return {
      loading: false,
      stats: []
    }
  },
  watch: {
    training: {
      handler: function () {
        this.load()
      },
      immediate: true
    }
  },
  methods: {
    load () {
      if (!this.training || !this.training.trainingId) {
        return
      }
      this.loading = true
      this.$http.request({
        method: 'get',
        url: `/web/api/trains/${this.training.trainingId}/stats`
      }).then((res) => {
        this.stats = res.data.data || []
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    openDrawer (stat) {
      this.$refs.studentTrainDrawer.open(stat, this.training.schoolId)
    }
  }
}
</script>

<style>
.info{margin-bottom:15px;}
.info>label{color:#909399;}
.info>span{margin:0 30px 0 10px;}
</style>