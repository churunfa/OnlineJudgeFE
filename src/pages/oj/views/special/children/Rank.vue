<template>
  <Panel shadow>
    <div slot="title">{{ special.title }}</div>
    <div slot="extra">
      <screen-full :height="18" :width="18" class="screen-full"></screen-full>
      <Poptip trigger="hover" placement="left-start">
        <Icon type="android-settings" size="20"></Icon>
        <div slot="content" id="switches">
          <p>
            <span>{{$t('m.Menu')}}</span>
            <i-switch v-model="showMenu"></i-switch>
<!--            <span>{{$t('m.Chart')}}</span>-->
<!--            <i-switch v-model="showChart"></i-switch>-->
          </p>
          <p>
<!--            <span>{{$t('m.Auto_Refresh')}}(10s)</span>-->
<!--            <i-switch :disabled="refreshDisabled" @on-change="handleAutoRefresh"></i-switch>-->
          </p>
          <template v-if="isSpecialAdmin">
            <p>
              <span>{{$t('m.RealName')}}</span>
              <i-switch v-model="showRealName"></i-switch>
            </p>
            <p>
<!--              <span>{{$t('m.Force_Update')}}</span>-->
<!--              <i-switch :disabled="refreshDisabled" v-model="forceUpdate"></i-switch>-->
            </p>
          </template>
          <template>
            <Button type="primary" size="small" @click="downloadRankCSV">{{$t('m.download_csv')}}</Button>
          </template>
        </div>
      </Poptip>
    </div>
    <div v-show="showChart" class="echarts">
      <ECharts :options="options" ref="chart" auto-resize></ECharts>
    </div>
    <Table ref="tableRank" :columns="columns" :data="dataRank" disabled-hover height="600"></Table>
    <Pagination :total="total"
                :page-size.sync="limit"
                :current.sync="page"
                @on-change="getSpecialRankData"
                @on-page-size-change="getSpecialRankData(1)"
                show-sizer></Pagination>
  </Panel>
</template>
<script>
import moment from 'moment'
import { mapActions } from 'vuex'

import Pagination from '@oj/components/Pagination'
import SpecialRankMixin from './specialRankMixin'
import time from '@/utils/time'
import utils from '@/utils/utils'

export default {
  name: 'rank',
  components: {
    Pagination
  },
  mixins: [SpecialRankMixin],
  data () {
    return {
      total: 0,
      page: 1,
      specialID: '',
      columns: [
        {
          align: 'center',
          width: 50,
          fixed: 'left',
          render: (h, params) => {
            return h('span', {}, params.index + (this.page - 1) * this.limit + 1)
          }
        },
        {
          title: this.$i18n.t('m.User_User'),
          align: 'center',
          fixed: 'left',
          width: 150,
          render: (h, params) => {
            return h('a', {
              style: {
                display: 'inline-block',
                'max-width': '150px'
              },
              on: {
                click: () => {
                  this.$router.push(
                    {
                      name: 'user-home',
                      query: {username: params.row.user.username}
                    })
                }
              }
            }, params.row.user.username)
          }
        },
        {
          title: 'AC / ' + this.$i18n.t('m.Total'),
          align: 'center',
          width: 100,
          render: (h, params) => {
            return h('span', {}, [
              h('span', {}, params.row.accepted_number + ' / '),
              h('a', {
                on: {
                  click: () => {
                    this.$router.push({
                      name: 'special-submission-list',
                      query: {username: params.row.user.username}
                    })
                  }
                }
              }, params.row.submission_number)
            ])
          }
        },
        {
          title: this.$i18n.t('m.TotalTime'),
          align: 'center',
          width: 100,
          render: (h, params) => {
            return h('span', this.parseTotalTime(params.row.total_time))
          }
        }
      ],
      dataRank: [],
      options: {
        title: {
          text: this.$i18n.t('m.Top_10_Teams'),
          left: 'center'
        },
        dataZoom: [
          {
            type: 'inside',
            filterMode: 'none',
            xAxisIndex: [0],
            start: 0,
            end: 100
          }
        ],
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {show: true, title: this.$i18n.t('m.save_as_image')}
          },
          right: '5%'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            axis: 'x'
          }
        },
        legend: {
          orient: 'vertical',
          y: 'center',
          right: 0,
          data: [],
          formatter: (value) => {
            return utils.breakLongWords(value, 16)
          },
          textStyle: {
            fontSize: 12
          }
        },
        grid: {
          x: 80,
          x2: 200
        },
        xAxis: [{
          type: 'time',
          splitLine: false,
          axisPointer: {
            show: true,
            snap: true
          }
        }],
        yAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: [0]
          }],
        series: []
      }
    }
  },
  mounted () {
    this.specialID = this.$route.params.specialID
    this.getSpecialRankData(1)
    if (this.specialProblems.length === 0) {
      this.getSpecialProblems().then((res) => {
        this.addTableColumns(res.data.data)
        this.addChartCategory(res.data.data)
      })
    } else {
      this.addTableColumns(this.specialProblems)
      this.addChartCategory(this.specialProblems)
    }
  },
  methods: {
    ...mapActions(['getSpecialProblems']),
    addChartCategory (specialProblems) {
      let category = []
      for (let i = 0; i <= specialProblems.length; ++i) {
        category.push(i)
      }
      this.options.yAxis[0].data = category
    },
    applyToChart (rankData) {
      let [users, seriesData] = [[], []]
      rankData.forEach(rank => {
        users.push(rank.user.username)
        let info = rank.submission_info
        // 提取出已AC题目的时间
        let timeData = []
        Object.keys(info).forEach(problemID => {
          if (info[problemID].is_ac) {
            timeData.push(info[problemID].ac_time)
          }
        })
        timeData.sort((a, b) => {
          return a - b
        })

        let data = []
        data.push([this.special.start_time, 0])
        // index here can be regarded as stacked accepted number count.
        for (let [index, value] of timeData.entries()) {
          let realTime = moment(this.special.start_time).add(value, 'seconds').format()
          data.push([realTime, index + 1])
        }
        seriesData.push({
          name: rank.user.username,
          type: 'line',
          data
        })
      })
      this.options.legend.data = users
      this.options.series = seriesData
    },
    applyToTable (data) {
      // deepcopy
      let dataRank = JSON.parse(JSON.stringify(data))
      // 从submission_info中取出相应的problem_id 放入到父object中,这么做主要是为了适应iview table的data格式
      // 见https://www.iviewui.com/components/table
      dataRank.forEach((rank, i) => {
        let info = rank.submission_info
        let cellClass = {}
        Object.keys(info).forEach(problemID => {
          dataRank[i][problemID] = info[problemID]
          dataRank[i][problemID].ac_time = time.secondFormat(dataRank[i][problemID].ac_time)
          let status = info[problemID]
          if (status.is_first_ac) {
            cellClass[problemID] = 'first-ac'
          } else if (status.is_ac) {
            cellClass[problemID] = 'ac'
          } else {
            cellClass[problemID] = 'wa'
          }
        })
        dataRank[i].cellClassName = cellClass
      })
      this.dataRank = dataRank
    },
    addTableColumns (problems) {
      // 根据题目添加table column
      problems.forEach(problem => {
        this.columns.push({
          align: 'center',
          key: problem.id,
          width: problems.length > 15 ? 80 : null,
          renderHeader: (h, params) => {
            return h('a', {
              'class': {
                'emphasis': true
              },
              on: {
                click: () => {
                  this.$router.push({
                    name: 'special-problem-details',
                    params: {
                      specialID: this.specialID,
                      problemID: problem._id
                    }
                  })
                }
              }
            }, problem._id)
          },
          render: (h, params) => {
            if (params.row[problem.id]) {
              let status = params.row[problem.id]
              let acTime, errorNumber
              if (status.is_ac) {
                acTime = h('span', status.ac_time)
              }
              if (status.error_number !== 0) {
                errorNumber = h('p', '(-' + status.error_number + ')')
              }
              return h('div', [acTime, errorNumber])
            }
          }
        })
      })
    },
    parseTotalTime (totalTime) {
      let m = moment.duration(totalTime, 's')
      return [Math.floor(m.asHours()), m.minutes(), m.seconds()].join(':')
    },
    downloadRankCSV () {
      utils.downloadFile(`special_rank?download_csv=1&special_id=${this.$route.params.specialID}&force_refrash=${this.forceUpdate ? '1' : '0'}`)
    }
  }
}
</script>
<style scoped lang="less">
.echarts {
  margin: 20px auto;
  height: 400px;
  width: 98%;
}

.screen-full {
  margin-right: 8px;
}

#switches {
  p {
    margin-top: 5px;
    &:first-child {
      margin-top: 0;
    }
    span {
      margin-left: 8px;
    }
  }
}
</style>
