<template>
  <div>
    <div class="info">
      <label>上课时间:</label>
      <span>{{formatTrainingTime(training)}}</span>
      <label>课程:</label>
      <span>{{training.courseName}}</span>
      <label>老师:</label>
      <span>{{training.teacherName}}</span>
      <label>班级:</label>
      <span>{{training.fullClazzName}}</span>
      <label>完课情况:</label>
      <span>{{`${(training.courseItemPositions || []).length} / ${training.courseItemCount || 0}`}}</span>
    </div>
    <div ref="chart" style="width:100%;height:280px"></div>
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
import { formatTimestamp, formatMinuteAndSecond } from '@/util'

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
        url: `/web/api/trainings/${this.training.trainingId}/stats`
      }).then((res) => {
        this.stats = res.data.data || []
        this.loading = false
      }).catch(() => {
        this.loading = false
      })

      this.$http.request({
        method: 'get',
        url: `/web/api/trainings/${this.training.trainingId}/points`
      }).then((res) => {
        this.renderChart(res.data.data || [])
      }).catch(() => {
        this.renderChart([])
      })
    },
    renderChart (points) {
      let maxHeartRates = []
      let minHeartRates = []
      let avgHeartRates = []
      let maxDiastolicPressures = []
      let minDiastolicPressures = []
      let avgDiastolicPressures = []
      let maxSystolicPressures = []
      let minSystolicPressures = []
      let avgSystolicPressures = []
      let maxBloodOxygens = []
      let minBloodOxygens = []
      let avgBloodOxygens = []
      let times = []
      if (points.length > 0) {
        let offsetTime = points[0].time
        for (let i = 0; i < points.length; i++) {
          let point = points[i]
          maxHeartRates.push(point.maxHeartRate)
          minHeartRates.push(point.minHeartRate)
          avgHeartRates.push(point.avgHeartRate)
          maxDiastolicPressures.push(point.maxDiastolicPressure)
          minDiastolicPressures.push(point.minDiastolicPressure)
          avgDiastolicPressures.push(point.avgDiastolicPressure)
          maxSystolicPressures.push(point.maxSystolicPressure)
          minSystolicPressures.push(point.minSystolicPressure)
          avgSystolicPressures.push(point.avgSystolicPressure)
          maxBloodOxygens.push(point.maxBloodOxygen)
          minBloodOxygens.push(point.minBloodOxygen)
          avgBloodOxygens.push(point.avgBloodOxygen)
          times.push(formatMinuteAndSecond(point.time - offsetTime))
        }
      }

      let lineStyle = {
        width: 1
      }

      this.$echarts.init(this.$refs.chart).setOption({
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          top: '0%',
          left: '0%',
          data: ['平均心率', '最大心率', '最小心率', '平均舒张压', '最大舒张压', '最小舒张压', '平均收缩压', '最大收缩压', '最小收缩压', '平均血氧', '最大血氧', '最小血氧'],
          selected: {
            '平均心率': true,
            '最大心率': true,
            '最小心率': true,
            '平均舒张压': false,
            '最大舒张压': false,
            '最小舒张压': false,
            '平均收缩压': false,
            '最大收缩压': false,
            '最小收缩压': false,
            '平均血氧': false,
            '最大血氧': false,
            '最小血氧': false
          }
        },
        toolbox: {
          show: true,
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            restore: {}
          },
          top: '0%',
          right: '0%'
        },
        grid: {
          left: '30px',
          right: '25px',
          bottom: '45px',
          top: '50px'
        },
        xAxis: {
          type: 'category',
          data: times,
          boundaryGap: false
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '平均心率',
          type: 'line',
          data: avgHeartRates,
          lineStyle: lineStyle,
          color: '#ed1941',
          showSymbol: false
        }, {
          name: '最大心率',
          type: 'line',
          data: maxHeartRates,
          lineStyle: lineStyle,
          color: '#ef4136',
          showSymbol: false
        }, {
          name: '最小心率',
          type: 'line',
          data: minHeartRates,
          lineStyle: lineStyle,
          color: '#840228',
          showSymbol: false
        }, {
          name: '平均舒张压',
          type: 'line',
          data: avgDiastolicPressures,
          lineStyle: lineStyle,
          color: '#444693',
          showSymbol: false
        }, {
          name: '最大舒张压',
          type: 'line',
          data: maxDiastolicPressures,
          lineStyle: lineStyle,
          color: '#2a5caa',
          showSymbol: false
        }, {
          name: '最小舒张压',
          type: 'line',
          data: minDiastolicPressures,
          lineStyle: lineStyle,
          color: '#102b6a',
          showSymbol: false
        }, {
          name: '平均收缩压',
          type: 'line',
          data: avgSystolicPressures,
          lineStyle: lineStyle,
          color: '#fcaf17',
          showSymbol: false
        }, {
          name: '最大收缩压',
          type: 'line',
          data: maxSystolicPressures,
          lineStyle: lineStyle,
          color: '#ffe600',
          showSymbol: false
        }, {
          name: '最小收缩压',
          type: 'line',
          data: minSystolicPressures,
          lineStyle: lineStyle,
          color: '#dec674',
          showSymbol: false
        }, {
          name: '平均血氧',
          type: 'line',
          data: avgBloodOxygens,
          lineStyle: lineStyle,
          color: '#1d953f',
          showSymbol: false
        }, {
          name: '最大血氧',
          type: 'line',
          data: maxBloodOxygens,
          lineStyle: lineStyle,
          color: '#225a1f',
          showSymbol: false
        }, {
          name: '最小血氧',
          type: 'line',
          data: minBloodOxygens,
          lineStyle: lineStyle,
          color: '#006c54',
          showSymbol: false
        }]
      })
    },
    openDrawer (stat) {
      this.$refs.studentTrainDrawer.open(stat, this.training.schoolId)
    },
    formatTrainingTime (training) {
      let startTime = formatTimestamp(new Date(training.startTime * 1000))
      let endTime = formatTimestamp(new Date(training.endTime * 1000))
      return `${startTime.substring(0, 16)} ~ ${endTime.substring(10, 16)}`
    }
  }
}
</script>

<style>
.info{margin-bottom:15px;}
.info>label{color:#909399;}
.info>span{margin:0 30px 0 10px;}
</style>