<template>
  <div class="app-header">
    <div class="app-title">体能训练辅助系统</div>
    <div class="app-profile">
      <el-dropdown @command="onProfileMenuClick">
        <span class="app-username">&nbsp;{{username}}<i class="el-icon-arrow-down el-icon--right"></i></span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="updatePassword">重置密码</el-dropdown-item>
          <el-dropdown-item command="logout" divided>退出</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <update-password-dialog ref="updatePasswordDialog"></update-password-dialog>
  </div>
</template>

<script>
import UpdatePasswordDialog from './UpdatePasswordDialog'

export default {
  name: 'app-header',
  components: {
    UpdatePasswordDialog
  },
  computed: {
    username () {
      return this.$store.state.admin.username
    }
  },
  methods: {
    onProfileMenuClick (command) {
      if (command === 'updatePassword') {
        this.$refs.updatePasswordDialog.open()
      } else if (command === 'logout') {
        this.logout()
      }
    },
    logout () {
      this.$http.request({
        method: 'post',
        url: '/web/api/admins/logout',
      }).then(() => {
        sessionStorage.clear()
        location.reload()
      })
    }
  }
}
</script>

<style>
.app-header{height:50px;line-height:50px;background-color:#fff;background-image:linear-gradient(to bottom,#fff,#fefefe);box-shadow:1px 1px 3px rgba(0, 0, 0, 0.1);}
.app-title{float:left;height:100%;font-size:18px;width:240px;box-sizing:border-box;padding-left:20px;background-color:#0E2533;color:#2fd6a9;}
.app-profile{float:right;margin:0 20px;}
.app-profile>div{display:block;}
.app-username{color:#2fd6a9;}
</style>
