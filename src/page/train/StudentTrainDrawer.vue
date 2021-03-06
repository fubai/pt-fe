<template>
  <div>
    <el-drawer :title="stat.studentName" :visible.sync="show" :append-to-body="true" :withHeader="false" custom-class="drawer-train" size="35%">
      <div class="drawer-title">
        {{stat.studentName || ''}}
        <el-tag>上课时长: {{getDurationText(stat.duration)}}</el-tag>
      </div>
      <div :class="showBottom !== false ? 'drawer-body' : 'drawer-body1'">
        <div ref="chart" style="width:100%;height:280px"></div>
        <el-row :gutter="60" class="row-ball" style="margin-top:20px;">
          <el-col :span="8">
            <div>
              <span>{{stat.calorie || '-'}}</span>
              <p>卡路里</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div>
              <span>{{stat.distance || '-'}}</span>
              <p>运动距离</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div>
              <span>{{stat.stepCount || '-'}}</span>
              <p>步数</p>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="60" class="row-ball" style="margin-top:20px;">
          <el-col :span="8">
            <div>
              <span>{{stat.avgHeartRate || '-'}}</span>
              <p>平均心率</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div>
              <span>{{stat.maxHeartRate || '-'}}</span>
              <p>最大心率</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div>
              <span>{{stat.minHeartRate || '-'}}</span>
              <p>最小心率</p>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="60" class="row-ball" style="margin-top:20px;">
          <el-col :span="8">
            <div>
              <span>{{stat.avgDiastolicPressure || '-'}}</span>
              <p>平均舒张压</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div>
              <span>{{stat.maxDiastolicPressure || '-'}}</span>
              <p>最大舒张压</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div>
              <span>{{stat.minDiastolicPressure || '-'}}</span>
              <p>最小舒张压</p>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="60" class="row-ball" style="margin-top:20px;">
          <el-col :span="8">
            <div>
              <span>{{stat.avgSystolicPressure || '-'}}</span>
              <p>平均收缩压</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div>
              <span>{{stat.maxSystolicPressure || '-'}}</span>
              <p>最大收缩压</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div>
              <span>{{stat.minSystolicPressure || '-'}}</span>
              <p>最小收缩压</p>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="60" class="row-ball" style="margin-top:20px;">
          <el-col :span="8">
            <div>
              <span>{{stat.avgBloodOxygen || '-'}}</span>
              <p>平均血氧</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div>
              <span>{{stat.maxBloodOxygen || '-'}}</span>
              <p>最大血氧</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div>
              <span>{{stat.minBloodOxygen || '-'}}</span>
              <p>最小血氧</p>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="drawer-bottom" v-if="showBottom !== false" @click="toViewStudentTrainList">查看全部记录</div>
    </el-drawer>
    <student-train-list ref="studentTrainList"></student-train-list>
  </div>
</template>

<script>
import { int32ToBytes, formatMinuteAndSecond, getDurationText } from '@/util'
import StudentTrainList from './StudentTrainList'

export default {
  name: 'student-train-drawer',
  components: {
    StudentTrainList
  },
  props: {
    showBottom: { type: Boolean, require: false, default: true }
  },
  data () {
    return {
      show: false,
      stat: {},
      schoolId: null
    }
  },
  methods: {
    open (stat, schoolId) {
      this.stat = stat
      this.schoolId = schoolId
      this.show = true

      this.$http.request({
        method: 'get',
        url: `/web/api/students/${stat.studentId}/trainings/${stat.trainingId}/points`
      }).then((res) => {
        this.renderChart(res.data.data || [])
      }).catch(() => {
        this.renderChart([])
      })
    },
    renderChart (points) {
      let heartRates = []
      let diastolicPressures = []
      let systolicPressures = []
      let bloodOxygens = []
      let times = []
      if (points.length > 0) {
        let offsetTime = points[0].time
        for (let i = 0; i < points.length; i++) {
          let point = points[i]
          let vs = int32ToBytes(point.physiology)
          heartRates.push(vs[0])
          diastolicPressures.push(vs[1])
          systolicPressures.push(vs[2])
          bloodOxygens.push(vs[3])
          times.push(formatMinuteAndSecond(point.time - offsetTime))
        }
      }

      let lineStyle = {
        width: 1
      }

      let markPoint = {
        data: [
          { type: 'max', name: '最大值' },
          { type: 'min', name: '最小值' }
        ]
      }

      let markLine = {
        data: [
          { type: 'average', name: '平均值' }
        ]
      }

      this.$echarts.init(this.$refs.chart).setOption({
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          top: '0%',
          left: '0%',
          data: ['心率', '舒张压', '收缩压', '血氧'],
          selected: {
            '心率': true,
            '舒张压': false,
            '收缩压': false,
            '血氧': false
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
          left: '8%',
          right: '10%',
          bottom: '15%',
          top: '16%'
        },
        xAxis: {
          type: 'category',
          data: times,
          boundaryGap: false,
          name: '时间'
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '心率',
          type: 'line',
          data: heartRates,
          lineStyle: lineStyle,
          markPoint: markPoint,
          markLine: markLine,
          color: '#ed1941',
          showSymbol: false
        }, {
          name: '舒张压',
          type: 'line',
          data: diastolicPressures,
          lineStyle: lineStyle,
          markPoint: markPoint,
          markLine: markLine,
          color: '#444693',
          showSymbol: false
        }, {
          name: '收缩压',
          type: 'line',
          data: systolicPressures,
          lineStyle: lineStyle,
          markPoint: markPoint,
          markLine: markLine,
          color: '#fcaf17',
          showSymbol: false
        }, {
          name: '血氧',
          type: 'line',
          data: bloodOxygens,
          lineStyle: lineStyle,
          markPoint: markPoint,
          markLine: markLine,
          color: '#1d953f',
          showSymbol: false
        }]
      })
    },
    toViewStudentTrainList () {
      this.$refs.studentTrainList.open(this.schoolId, this.stat)
    },
    getDurationText (duration) {
      return getDurationText(duration)
    }
  }
}
</script>

<style>
.drawer-train>section{height:100%;}
.drawer-title{
  width: 100%;
  height: 80px;
  line-height: 80px;
  font-size:24px;
  padding: 0 20px;
  color: #606266;
}
.drawer-title>.el-tag{
  float: right;
  font-size: 18px;
  margin-top: 24px;
}
.drawer-body{
  padding:0 20px 20px;
  overflow-y: scroll;
  height: calc(100% - 130px);
}
.drawer-body1{
  padding:0 20px 20px;
  overflow-y: scroll;
  height: calc(100% - 80px);
}
.drawer-bottom{
  width: 100%;
  height: 50px;
  line-height: 50px;
  background-color: #2fd6a9;
  color: #fff;
  text-align: center;
  cursor: pointer;
}
.row-ball>.el-col>div{
  position: relative;
  width: 100%;
  padding-top: calc(100% + 50px);
  height: 0;
}
.row-ball>.el-col>div>span{
  position: absolute;
  top: calc(50% - 35px);
  left:0;
  right:0;
  display: block;
  text-align: center;
  height: 24px;
  line-height: 24px;
  font-size: 24px;
  color: #fff;
  z-index: 1;
}
.row-ball>.el-col>div>p{
  position: absolute;
  left:0;
  right:0;
  bottom:15px;
  display: block;
  text-align: center;
  height: 18px;
  line-height: 18px;
  font-size: 18px;
  color: #606266;
  z-index: 1;
}
.row-ball>.el-col>div:after{
  content: ' ';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 50px;
  left: 0;
  background-color: #0094ff;
  background: radial-gradient(circle at 75% 25%, #45b97c, #00ae9d);
  border-radius: 50%;
}
</style>
