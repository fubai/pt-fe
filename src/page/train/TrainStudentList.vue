<template>
  <div>
    <el-table v-loading="loading" :data="stats" :stripe="true" size="mini" border @row-click="openDrawer" :row-style="{ cursor: 'pointer' }">
      <el-table-column type="index" label="序号"></el-table-column>
      <el-table-column prop="studentName" label="学生"></el-table-column>
      <el-table-column prop="avgHeartRate" label="平均心率" width="70px"></el-table-column>
      <el-table-column prop="maxHeartRate" label="最大心率" width="70px"></el-table-column>
      <el-table-column prop="minHeartRate" label="最小心率" width="70px"></el-table-column>
      <el-table-column prop="avgDiastolicPressure" label="平均舒张压" width="85px"></el-table-column>
      <el-table-column prop="maxDiastolicPressure" label="最大舒张压" width="85px"></el-table-column>
      <el-table-column prop="minDiastolicPressure" label="最小舒张压" width="85px"></el-table-column>
      <el-table-column prop="avgSystolicPressure" label="平均收缩压" width="85px"></el-table-column>
      <el-table-column prop="maxSystolicPressure" label="最大收缩压" width="85px"></el-table-column>
      <el-table-column prop="minSystolicPressure" label="最小收缩压" width="85px"></el-table-column>
      <el-table-column prop="avgBloodOxygen" label="平均血氧" width="70px"></el-table-column>
      <el-table-column prop="maxBloodOxygen" label="最大血氧" width="70px"></el-table-column>
      <el-table-column prop="minBloodOxygen" label="最小血氧" width="70px"></el-table-column>
      <el-table-column prop="stepCount" label="步数" width="60px"></el-table-column>
      <el-table-column prop="distance" label="运动距离" width="70px"></el-table-column>
      <el-table-column prop="calorie" label="卡路里" width="70px"></el-table-column>
      <el-table-column prop="duration" label="运动量" width="70px"></el-table-column>
    </el-table>
    <student-train-drawer ref="studentTrainDrawer"></student-train-drawer>
  </div>
</template>

<script>
export default {
  name: 'train-student-list',
  props: {
    schoolId: {type: Number, require: true},
    trainingId: {type: Number, require: true}
  },
  data () {
    return {
      loading: false,
      stats: []
    }
  },
  watch: {
    trainingId: {
      handler: function () {
        this.load()
      },
      immediate: true
    }
  },
  methods: {
    load () {
      if (!this.trainingId) {
        return
      }
      this.loading = true
      this.$http.request({
        method: 'get',
        url: `/web/api/trains/${this.trainingId}/stats`
      }).then((res) => {
        this.stats = res.data.data || []
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    openDrawer (stat) {
      this.$refs.studentTrainDrawer.open(stat, this.schoolId)
    }
  }
}
</script>
