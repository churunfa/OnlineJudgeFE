import moment from 'moment'
import api from '@oj/api'
import { USER_TYPE, CONTEST_TYPE } from '@/utils/constants'

const state = {
  now: moment(),
  access: false,
  rankLimit: 30,
  forceUpdate: false,
  special: {
    created_by: {},
    special_type: {},
    create_time: '',
    special_passwd_type: CONTEST_TYPE.PUBLIC
  },
  specialProblems: [],
  itemVisible: {
    menu: true,
    chart: true,
    realName: false
  }
}

const getters = {
  isSpecialAdmin: (state, getters, _, rootGetters) => {
    return rootGetters.isAuthenticated &&
      (state.special.created_by.id === rootGetters.user.id || rootGetters.user.admin_type === USER_TYPE.SUPER_ADMIN)
  },
  specialMenuDisabled: (state, getters) => {
    if (getters.isSpecialAdmin) return false
    if (state.special.special_passwd_type === CONTEST_TYPE.PUBLIC) return false
    return !state.access
  },
  passwordFormVisible_special: (state, getters) => {
    return state.special.special_passwd_type !== CONTEST_TYPE.PUBLIC && !state.access && !getters.isSpecialAdmin
  }
}

const mutations = {
  change_special (state, payload) {
    state.special = payload.special
  },
  change_special_item_visible (state, payload) {
    state.itemVisible = {...state.itemVisible, ...payload}
  },
  change_rank_force_update (state, payload) {
    state.forceUpdate = payload.value
  },
  change_special_problems (state, payload) {
    state.specialProblems = payload.specialProblems
  },
  change_special_rank_limit (state, payload) {
    state.rankLimit = payload.rankLimit
  },
  special_access (state, payload) {
    state.access = payload.access
  },
  clear_special (state) {
    state.special = {created_by: {}, special_type: {}}
    state.specialProblems = []
    state.access = false
    state.itemVisible = {
      menu: true,
      chart: true,
      realName: false
    }
    state.forceUpdate = false
  },
  change_now (state, payload) {
    state.now = payload.now
  },
  now_add_1s (state) {
    state.now = moment(state.now.add(1, 's'))
  }
}

const actions = {
  getSpecial ({commit, rootState, dispatch}) {
    return new Promise((resolve, reject) => {
      api.getSpecial(rootState.route.params.specialID).then((res) => {
        resolve(res)
        let special = res.data.data
        commit('change_special', {special: special})
        if (special.special_passwd_type === CONTEST_TYPE.PRIVATE) {
          dispatch('getSpecialAccess')
        }
      }, err => {
        reject(err)
      })
    })
  },
  getSpecialProblems ({commit, rootState}) {
    return new Promise((resolve, reject) => {
      api.getSpecialProblemList(rootState.route.params.specialID).then(res => {
        res.data.data.sort((a, b) => {
          if (a._id === b._id) {
            return 0
          } else if (a._id > b._id) {
            return 1
          }
          return -1
        })
        commit('change_special_problems', {specialProblems: res.data.data})
        resolve(res)
      }, () => {
        commit('change_special_problems', {specialProblems: []})
      })
    })
  },
  getSpecialAccess ({commit, rootState}) {
    return new Promise((resolve, reject) => {
      api.getSpecialAccess(rootState.route.params.specialID).then(res => {
        commit('special_access', {access: res.data.data.access})
        resolve(res)
      }).catch()
    })
  }
}

export default {
  state,
  mutations,
  getters,
  actions
}
