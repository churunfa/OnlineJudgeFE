<template>
  <div class="flex-container">
    <div id="contest-main">
      <!--children-->
      <transition name="fadeInUp">
        <router-view></router-view>
      </transition>
      <!--children end-->
      <div class="flex-container" v-if="route_name === 'special-details'">
        <template>
          <div id="contest-desc">
            <Panel :padding="20" shadow>
              <div slot="title">
                {{special.title}}
              </div>
<!--              <div slot="extra">-->
<!--                <Tag type="dot" :color="countdownColor">-->
<!--                  <span id="countdown">{{countdown}}</span>-->
<!--                </Tag>-->
<!--              </div>-->
              <div v-html="special.description" class="markdown-body"></div>
              <div v-if="passwordFormVisible_special" class="contest-password">
                <Input v-model="specialPassword" type="password"
                       placeholder="contest password" class="contest-password-input"
                       @on-enter="checkPassword"/>
                <Button type="info" @click="checkPassword">Enter</Button>
              </div>
            </Panel>
            <Table :columns="columns" :data="special_table" disabled-hover style="margin-bottom: 40px;"></Table>
          </div>
        </template>
      </div>

    </div>
    <div v-show="showMenu" id="contest-menu">
      <VerticalMenu @on-click="handleRoute">
        <VerticalMenu-item  :route="{name: 'special-details', params: {specialID: specialID}}">
          <Icon type="home"></Icon>
          {{$t('m.Overview')}}
        </VerticalMenu-item>

        <VerticalMenu-item :disabled="specialMenuDisabled"
                           :route="{name: 'special-announcement-list', params: {specialID: specialID}}">
          <Icon type="chatbubble-working"></Icon>
          {{$t('m.Announcements')}}
        </VerticalMenu-item>

        <VerticalMenu-item :disabled="specialMenuDisabled"
                           :route="{name: 'special-problem-list', params: {specialID: specialID}}">
          <Icon type="ios-photos"></Icon>
          {{$t('m.Problems')}}
        </VerticalMenu-item>

        <VerticalMenu-item :disabled="specialMenuDisabled"
                           :route="{name: 'special-submission-list'}">
          <Icon type="navicon-round"></Icon>
          {{$t('m.Submissions')}}
        </VerticalMenu-item>

        <VerticalMenu-item :disabled="specialMenuDisabled"
                           :route="{name: 'special-rank', params: {specialID: specialID}}">
          <Icon type="stats-bars"></Icon>
          {{$t('m.Rankings')}}
        </VerticalMenu-item>
      </VerticalMenu>
      <!--      <div onclick="">点击</div>-->
    </div>
  </div>
</template>

<script>
import api from '@oj/api'
import { mapState, mapGetters, mapActions } from 'vuex'
import { CONTEST_STATUS } from '@/utils/constants'
import time from '@/utils/time'

export default {
  name: 'SpecialDetail',
  components: {},
  data () {
    return {
      CONTEST_STATUS: CONTEST_STATUS,
      route_name: '',
      btnLoading: false,
      specialID: '',
      specialPassword: '',
      columns: [
        {
          title: this.$i18n.t('m.CreatAt'),
          render: (h, params) => {
            console.log(params.row)
            return h('span', time.utcToLocal(params.row.create_time))
          }
        },
        {
          title: this.$i18n.t('m.SpecialType'),
          render: (h, params) => {
            return h('span', params.row.special_type.title)
          }
        },
        {
          title: this.$i18n.t('m.Creator'),
          render: (h, data) => {
            let clo = this.$store.getters.usernameStyle(data.row.created_by)
            // data.row.created_by.username)
            return h('a',
              {
                class: [clo],
                on: {
                  click: () => {
                    this.$router.push({ path: '/user-home/?username=' + data.row.created_by.username })
                    // console.log('/user-home' + ?username=)
                  }
                }
              },
              data.row.created_by.username)
          }
        }
      ]
    }
  },
  mounted () {
    this.specialID = this.$route.params.specialID
    this.route_name = this.$route.name
    this.$store.dispatch('getSpecial').then(res => {
      this.changeDomTitle({title: res.data.data.title})
      this.$store.commit('change_special', {special: res.data.data})
    })
  },
  methods: {
    ...mapActions(['changeDomTitle']),
    handleRoute (route) {
      this.$router.push(route)
    },
    checkPassword () {
      if (this.specialPassword === '') {
        this.$error('Password can\'t be empty')
        return
      }
      this.btnLoading = true
      api.checkSpecialPassword(this.specialID, this.specialPassword).then((res) => {
        this.$success('Succeeded')
        this.$store.commit('special_access', {access: true})
        this.btnLoading = false
      }, (res) => {
        this.btnLoading = false
      })
    }
  },
  computed: {
    ...mapState({
      showMenu: state => state.special.itemVisible.menu,
      special: state => state.special.special,
      special_table: state => [state.special.special],
      now: state => state.special.now
    }),
    ...mapGetters(
      ['specialMenuDisabled', 'countdown', 'isSpecialAdmin', 'passwordFormVisible_special']
    ),
    // countdownColor () {
    //   if (this.contestStatus) {
    //     return CONTEST_STATUS_REVERSE[this.contestStatus].color
    //   }
    // },
    showAdminHelper () {
      return this.isSpecialAdmin
    }
  },
  watch: {
    '$route' (newVal) {
      this.route_name = newVal.name
      this.specialID = newVal.params.specialID
      this.changeDomTitle({title: this.special.title})
    }
  },
  beforeDestroy () {
    this.$store.commit('clear_special')
  }
}
</script>

<style scoped lang="less">
pre {
  display: inline-block;
}

#countdown {
  font-size: 16px;
}

.flex-container {
  #contest-main {
    flex: 1 1;
    width: 0;
    #contest-desc {
      flex: auto;
    }
  }
  #contest-menu {
    flex: none;
    width: 210px;
    margin-left: 20px;
  }
  .contest-password {
    margin-top: 20px;
    margin-bottom: -10px;
    &-input {
      width: 200px;
      margin-right: 10px;
    }
  }
}
</style>


<!--SpecialDetail-->
