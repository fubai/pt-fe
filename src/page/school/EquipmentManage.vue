<template>
  <el-dialog :title="`${field.schoolName} ${field.name}`" :visible.sync="show" width="580px" append-to-body :close-on-click-modal="false">
    <el-table :data="equipments" row-key="key" :stripe="true" border size="mini" v-loading="loading">
      <el-table-column prop="num" label="编号">
        <template slot-scope="scope">
          <el-input placeholder="请输入设备编号" v-model="scope.row.num" size="mini"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="sn" label="S/N">
        <template slot-scope="scope">
          <el-input placeholder="请输入设备S/N" v-model="scope.row.sn" size="mini"></el-input>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="78">
        <template slot-scope="scope">
          <el-button @click="toDelete(scope.$index)" type="danger" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div slot="footer" :loading="loading">
      <el-button size="small" @click="show = false" style="float:left">关闭</el-button>
      <el-button type="primary" size="small" @click="toAdd">添加设备</el-button>
      <el-button type="primary" size="small" @click="save">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'equipment-manage',
  data () {
    return {
      field: {},
      show: false,
      loading: false,
      equipments: []
    }
  },
  methods: {
    open (field) {
      this.field = field || {}
      this.show = true
      this.load()
    },
    load () {
      this.loading = true
      this.$http.request({
        method: 'get',
        url: `/web/api/fields/${this.field.fieldId}/equipments`
      }).then((res) => {
        let equipments = res.data.data || []
        for (let i = equipments.length - 1; i >= 0; i--) {
          equipments[i].key = equipments[i].sn
        }

        this.equipments = equipments
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    toAdd () {
      this.equipments.push({
        key: `${Math.random()}`
      })
    },
    toDelete (index) {
      this.equipments.splice(index, 1)
    },
    save () {
      let equipments = this.equipments || []
      let numMap = {}
      let snMap = {}
      for (let i = 0; i < equipments.length; i++) {
        let equipment = equipments[i]
        let num = equipment.num
        let sn = equipment.sn
        if (!num) {
          this.$message.error(`请填写设备编号`)
          return
        }
        if (!sn) {
          this.$message.error(`请填写设备S/N`)
          return
        }
        if (numMap[num]) {
          this.$message.error(`设备编号重复：${num}`)
          return
        }
        if (snMap[sn]) {
          this.$message.error(`设备S/N重复：${sn}`)
          return
        }
        numMap[num] = true
        snMap[sn] = true
      }

      this.$http.request({
        method: 'post',
        url: `/web/api/fields/${this.field.fieldId}/equipments`,
        data: JSON.stringify(equipments)
      }).then(() => {
        this.field.equipmentCount = equipments.length
        this.loading = false
        this.show = false
        this.$message.success(`保存成功`)
      }).catch(() => {
        this.loading = false
      })
    }
  }
}
</script>
