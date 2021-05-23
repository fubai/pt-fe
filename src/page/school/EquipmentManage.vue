<template>
  <el-dialog :title="`${field.schoolName} ${field.name}`" :visible.sync="show" width="580px" append-to-body :close-on-click-modal="false">
    <el-table :data="equipments" row-key="key" :stripe="true" border size="mini" v-loading="loading">
      <el-table-column prop="num" label="编号（最短2个字符，最长6个字符）">
        <template slot-scope="scope">
          <el-input placeholder="请输入设备编号" v-model="scope.row.num" size="mini" :maxlength="6"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="mac" label="蓝牙MAC地址（长度为12）">
        <template slot-scope="scope">
          <el-input placeholder="请输入设备的蓝牙MAC地址" v-model="scope.row.mac" size="mini" :maxlength="12"></el-input>
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
          equipments[i].key = equipments[i].mac
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
      let macMap = {}
      for (let i = 0; i < equipments.length; i++) {
        let equipment = equipments[i]
        let num = equipment.num
        let mac = equipment.mac
        if (!num) {
          this.$message.error(`请填写设备编号`)
          return
        }
        if (num.length < 2 || num.length > 6) {
          this.$message.error(`设备编号长度不能小于2，不能大于6`)
          return
        }
        if (!mac) {
          this.$message.error(`请填写设备的蓝牙MAC地址`)
          return
        }
        if (mac.length != 12) {
          this.$message.error(`MAC地址的长度必须为12`)
          return
        }
        if (numMap[num]) {
          this.$message.error(`设备编号重复：${num}`)
          return
        }
        if (macMap[mac]) {
          this.$message.error(`设备蓝牙MAC地址重复：${mac}`)
          return
        }
        numMap[num] = true
        macMap[mac] = true
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
