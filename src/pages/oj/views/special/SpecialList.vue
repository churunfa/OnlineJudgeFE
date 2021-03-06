<template>
  <Row type="flex">
    <Col :span="24">
      <Panel id="contest-card" shadow>
        <div slot="title">{{query.rule_type === '' ? this.$i18n.t('m.All') : query.rule_type}} {{$t('m.Special')}}</div>
        <div slot="extra">
          <ul class="filter">
            <li>
              <Input id="keyword" @on-enter="changeRoute" @on-click="changeRoute" v-model="query.keyword"
                     icon="ios-search-strong" placeholder="Keyword"/>
            </li>
          </ul>
        </div>
        <p id="no-contest" v-if="specials.length == 0">{{$t('m.No_special')}}</p>
        <ol id="contest-list">
          <li v-for="special in specials" :key="specials.title">
            <Row type="flex" justify="space-between" align="middle">
              <img class="trophy" src="../../../../assets/Cup.png"/>
              <Col :span="18" class="contest-main">
                <p class="title">
                  <a class="entry" @click.stop="goSpecialList(special)">
                    {{special.title}}
                  </a>
                  <template v-if="special.special_passwd_type != 'Public'">
                    <Icon type="ios-locked-outline" size="20"></Icon>
                  </template>
                </p>
                <ul class="detail">
                  <li>
                    <Icon type="calendar" color="#3091f2"></Icon>
                    {{special.create_time | localtime('YYYY-M-D HH:mm') }}
                  </li>
                  <li>
                    <Icon type="android-time" color="#3091f2"></Icon>
                    {{ $t('m.long_term') }}
                  </li>
                </ul>
              </Col>
              <Col :span="4" style="text-align: center"></Col>
            </Row>
          </li>
        </ol>
      </Panel>
      <Pagination :total="total" :pageSize="limit" @on-change="getSpecialList" :current.sync="page"></Pagination>
    </Col>
  </Row>

</template>

<script>

import api from '@oj/api'
import { mapGetters } from 'vuex'
import utils from '@/utils/utils'
import Pagination from '@/pages/oj/components/Pagination'
import { CONTEST_STATUS_REVERSE } from '@/utils/constants'

const limit = 8

export default {
  name: 'SpecialList',
  components: {
    Pagination
  },
  data () {
    return {
      page: 1,
      query: {
        type_id: '',
        keyword: ''
      },
      limit: limit,
      total: 0,
      rows: '',
      specials: [],
      CONTEST_STATUS_REVERSE: CONTEST_STATUS_REVERSE,
//      for password modal use
      cur_special_id: ''
    }
  },
  mounted () {
    this.query.type_id = this.$route.query.type_id
    this.getSpecialList()
  },
  methods: {
    init () {
      let route = this.$route.query
      this.query.keyword = route.keyword || ''
      this.page = parseInt(route.page) || 1
      this.getSpecialList()
    },
    getSpecialList (page = 1) {
      let offset = (page - 1) * this.limit
      api.getSpecialList(offset, this.limit, this.query).then((res) => {
        this.specials = res.data.data.results
        this.total = res.data.data.total
      })
    },
    changeRoute () {
      let query = Object.assign({}, this.query)
      query.page = this.page
      this.$router.push({
        name: 'special-list-details',
        query: utils.filterEmptyValue(query)
      })
    },
    onRuleChange (rule) {
      this.page = 1
      this.changeRoute()
    },
    onStatusChange (status) {
      this.page = 1
      this.changeRoute()
    },
    goSpecialList (special) {
      this.cur_special_id = special.id
      if (!this.isAuthenticated) {
        this.$error(this.$i18n.t('m.Please_login_first'))
        this.$store.dispatch('changeModalStatus', {visible: true})
      } else {
        this.$router.push({name: 'special-details', params: {specialID: special.id}})
      }
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'user'])
  },
  watch: {
    '$route' (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.init()
      }
    }
  }

}
</script>
<style lang="less" scoped>
#contest-card {
  #keyword {
    width: 80%;
    margin-right: 30px;
  }
  #no-contest {
    text-align: center;
    font-size: 16px;
    padding: 20px;
  }
  #contest-list {
    > li {
      padding: 20px;
      border-bottom: 1px solid rgba(187, 187, 187, 0.5);
      list-style: none;

      .trophy {
        height: 40px;
        margin-left: 10px;
        margin-right: -20px;
      }
      .contest-main {
        .title {
          font-size: 18px;
          a.entry {
            color: #495060;
            &:hover {
              color: #2d8cf0;
              border-bottom: 1px solid #2d8cf0;
            }
          }
        }
        li {
          display: inline-block;
          padding: 10px 0 0 10px;
          &:first-child {
            padding: 10px 0 0 0;
          }
        }
      }
    }
  }
}
</style>
