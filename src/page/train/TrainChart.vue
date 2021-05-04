<template>
  <el-row :gutter="10">
    <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8"><div ref="chart1" style="width:100%;height:280px"></div></el-col>
    <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8"><div ref="chart2" style="width:100%;height:280px"></div></el-col>
    <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8"><div ref="chart3" style="width:100%;height:280px"></div></el-col>
  </el-row>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'train-chart',
  methods: {
    renderChart (dayCounts, dayCourseItemCompleteRates, dayAvgHeartRates) {
      this.renderChart1(dayCounts)
      this.renderChart2(dayCourseItemCompleteRates)
      this.renderChart3(dayAvgHeartRates)
    },
    renderChart1 (dayCounts) {
      let dates = []
      let values = []
      for (let i = 0; i < dayCounts.length; i++) {
        let dayCount = dayCounts[i]
        dates.push(dayCount.key)
        values.push(dayCount.value)
      }

      echarts.init(this.$refs.chart1).setOption({
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          top: '0%',
          left: '0%',
          data: ['上课数量']
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
          right: '8%'
        },
        grid: {
          bottom: '10%',
          right: '8%'
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisTick: {
            alignWithLabel: true
          }
        },
        yAxis: {
          type: 'value',
          minInterval: 1
        },
        series: [{
          name: '上课数量',
          type: 'line',
          data: values,
          showSymbol: false
        }]
      })
    },
    renderChart2 (dayCourseItemCompleteRates) {
      let dates = []
      let values = []
      for (let i = 0; i < dayCourseItemCompleteRates.length; i++) {
        let dayCourseItemCompleteRate = dayCourseItemCompleteRates[i]
        dates.push(dayCourseItemCompleteRate.key)
        values.push(dayCourseItemCompleteRate.value * 100)
      }

      echarts.init(this.$refs.chart2).setOption({
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br>课程完成度: {c}%'
        },
        legend: {
          top: '0%',
          left: '0%',
          data: ['课程完成度']
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
          right: '8%'
        },
        grid: {
          bottom: '10%',
          right: '8%'
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisTick: {
            alignWithLabel: true
          }
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          axisLabel: {
            formatter: function (value) {
              return `${value}%`
            }
          }
        },
        series: [{
          name: '课程完成度',
          type: 'bar',
          barWidth: '12%',
          data: values
        }]
      })
    },
    renderChart3 (dayAvgHeartRates) {
      let dates = []
      let values = []
      for (let i = 0; i < dayAvgHeartRates.length; i++) {
        let dayAvgHeartRate = dayAvgHeartRates[i]
        dates.push(dayAvgHeartRate.key)
        values.push(dayAvgHeartRate.value)
      }

      echarts.init(this.$refs.chart3).setOption({
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          top: '0%',
          left: '0%',
          data: ['平均心率']
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
          right: '8%'
        },
        grid: {
          bottom: '10%',
          right: '8%'
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisTick: {
            alignWithLabel: true
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '平均心率',
          type: 'line',
          data: values,
          showSymbol: false
        }]
      })
    }
  }
}
</script>
