<template>
  <div>
    <Panel>
      <div slot="title">{{$t('m.Problems_List')}}</div>
      <Table :columns="ACMTableColumns"
             :data="problems"
             @on-row-click="goSpecialProblem"
             :no-data-text="$t('m.No_Problems')"></Table>
<!--      <Table v-else-->
<!--             :data="problems"-->
<!--             :columns="OITableColumns"-->
<!--             @on-row-click="goSpecialProblem"-->
<!--             no-data-text="$t('m.No_Problems')"></Table>-->
    </Panel>
  </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
import {ProblemMixin} from '@oj/components/mixins'

export default {
  name: 'SpecialProblemList',
  mixins: [ProblemMixin],
  data () {
    return {
      ACMTableColumns: [
        {
          title: '#',
          key: '_id',
          sortType: 'asc',
          width: 150
        },
        {
          title: this.$i18n.t('m.Title'),
          key: 'title'
        },
        {
          title: this.$i18n.t('m.Total'),
          key: 'submission_number'
        },
        {
          title: this.$i18n.t('m.AC_Rate'),
          render: (h, params) => {
            return h('span', this.getACRate(params.row.accepted_number, params.row.submission_number))
          }
        }
      ],
      OITableColumns: [
        {
          title: '#',
          key: '_id',
          width: 150
        },
        {
          title: this.$i18n.t('m.Title'),
          key: 'title'
        }
      ]
    }
  },
  mounted () {
    this.getSpecialProblems()
  },
  methods: {
    getSpecialProblems () {
      this.$store.dispatch('getSpecialProblems').then(res => {
        if (this.isAuthenticated) {
          this.addStatusColumn(this.ACMTableColumns, res.data.data)
        }
      })
    },
    goSpecialProblem (row) {
      this.$router.push({
        name: 'special-problem-details',
        params: {
          specialID: this.$route.params.specialID,
          problemID: row._id
        }
      })
    }
  },
  computed: {
    ...mapState({
      problems: state => state.special.specialProblems
    }),
    ...mapGetters(['isAuthenticated', 'contestRuleType', 'OIContestRealTimePermission'])
  }
}
</script>

<style scoped lang="less">
</style>
