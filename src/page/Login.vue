<template>
  <div class="login-container">
    <el-card class="login-card">
      <div slot="header">体能训练辅助系统</div>
      <el-form :model="loginForm" :rules="loginFormRule" ref="loginForm" :status-icon="true">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-mobile-phone" placeholder="请输入用户名" ref="username" :maxlength="40"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-view" placeholder="请输入密码" type="password" :maxlength="40"></el-input>
        </el-form-item>
      </el-form>
      <el-button type="primary" round @click="login" :loading="loading">登 录</el-button>
    </el-card>
  </div>
</template>

<script>
import md5 from 'js-md5'

export default {
  name: 'login',
  data () {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginFormRule: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      loading: false
    }
  },
  methods: {
    login () {
      this.$refs.loginForm.validate((success) => {
        if (success) {
          this.loading = true
          this.$http.request({
            method: 'post',
            url: '/web/api/admins/login',
            data: JSON.stringify({
              username: this.loginForm.username,
              password: md5(this.loginForm.password)
            })
          }).then((res) => {
            sessionStorage.setItem('admin', JSON.stringify(res.data.data))
            this.$store.commit('admin', res.data.data)
            this.loading = false
            location.reload()
          }).catch(() => {
            this.loading = false
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style>
.login-container{padding-top:0.1px;background:rgba(33, 43, 71);height:100vh;}
.login-card{width:600px;margin:8% auto 0;}
.login-card .el-button{width:100%;margin:0px auto;}
</style>
