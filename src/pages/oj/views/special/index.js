const SpecialTypeList = () => import(/* webpackChunkName: "SpecialTypeList" */ './SpecialTypeList.vue')
const SpecialList = () => import(/* webpackChunkName: "SpecialList" */ './SpecialList')
const SpecialDetail = () => import(/* webpackChunkName: "SpecialDetail" */ './SpecialDetail')
const SpecialProblemList = () => import(/* webpackChunkName: "SpecialProblemList" */ './children/SpecialProblemList')
const SpecialRank = () => import(/* webpackChunkName: "SpecialRank" */ './children/SpecialRank')

export {SpecialTypeList, SpecialList, SpecialDetail, SpecialProblemList, SpecialRank}
