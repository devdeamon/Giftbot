export interface Translations {
  // Header
  title: string
  subtitle: string
  operator: string
  status: string
  protocol: string
  platform: string

  // Mining
  shardsFound: string
  minerLevel: string
  miningProtocol: string
  timeRemaining: string
  miningDepth: string
  protocolActive: string
  protocolIdle: string
  startMining: string
  stopMining: string
  collectShards: string
  upgradeMiner: string
  useMainButton: string

  // User Profile Modal
  userProfile: string
  accountType: string
  premium: string
  standard: string
  joinDate: string
  systemInfo: string
  version: string
  close: string

  // Navigation
  mining: string
  wallet: string
  tasks: string
  rating: string

  // Wallet
  balance: string
  giftTokens: string
  showBalance: string
  hideBalance: string
  send: string
  receive: string
  transactionHistory: string
  noTransactions: string
  sendTokens: string
  receiveTokens: string
  recipientAddress: string
  amount: string
  cancel: string
  confirm: string
  yourAddress: string
  shareAddress: string

  // Tasks
  dailyTasks: string
  achievements: string
  social: string
  allTasks: string
  taskDetails: string
  missionBriefing: string
  progress: string
  reward: string
  claim: string
  claimed: string
  share: string

  // Rating
  leaderboard: string
  yourRank: string
  season: string
  seasonEnds: string
  nextRank: string
  challenges: string
  playerProfile: string
  rank: string
  shards: string
  level: string

  // Common
  loading: string
  error: string
  success: string
  online: string
  offline: string
  active: string
  idle: string
}

export const translations: Record<string, Translations> = {
  en: {
    // Header
    title: "GIFT SHARD MINING",
    subtitle: "DEEP MINING PROTOCOL ACTIVE",
    operator: "OPERATOR",
    status: "STATUS",
    protocol: "PROTOCOL",
    platform: "PLATFORM",

    // Mining
    shardsFound: "SHARDS_FOUND",
    minerLevel: "MINER_LEVEL",
    miningProtocol: "MINING_PROTOCOL",
    timeRemaining: "TIME_REMAINING",
    miningDepth: "MINING_DEPTH",
    protocolActive: "PROTOCOL_ACTIVE",
    protocolIdle: "PROTOCOL_IDLE",
    startMining: "START_MINING",
    stopMining: "STOP_MINING",
    collectShards: "COLLECT_SHARDS",
    upgradeMiner: "UPGRADE_MINER",
    useMainButton: "USE_MAIN_BUTTON_FOR_CONTROL",

    // User Profile Modal
    userProfile: "USER_PROFILE",
    accountType: "ACCOUNT_TYPE",
    premium: "PREMIUM",
    standard: "STANDARD",
    joinDate: "JOIN_DATE",
    systemInfo: "SYSTEM_INFO",
    version: "VERSION",
    close: "CLOSE",

    // Navigation
    mining: "MINING",
    wallet: "WALLET",
    tasks: "TASKS",
    rating: "RATING",

    // Wallet
    balance: "BALANCE",
    giftTokens: "GIFT_TOKENS",
    showBalance: "SHOW_BALANCE",
    hideBalance: "HIDE_BALANCE",
    send: "SEND",
    receive: "RECEIVE",
    transactionHistory: "TRANSACTION_HISTORY",
    noTransactions: "NO_TRANSACTIONS_YET",
    sendTokens: "SEND_TOKENS",
    receiveTokens: "RECEIVE_TOKENS",
    recipientAddress: "RECIPIENT_ADDRESS",
    amount: "AMOUNT",
    cancel: "CANCEL",
    confirm: "CONFIRM",
    yourAddress: "YOUR_ADDRESS",
    shareAddress: "SHARE_ADDRESS",

    // Tasks
    dailyTasks: "DAILY_TASKS",
    achievements: "ACHIEVEMENTS",
    social: "SOCIAL",
    allTasks: "ALL_TASKS",
    taskDetails: "TASK_DETAILS",
    missionBriefing: "MISSION_BRIEFING",
    progress: "PROGRESS",
    reward: "REWARD",
    claim: "CLAIM",
    claimed: "CLAIMED",
    share: "SHARE",

    // Rating
    leaderboard: "LEADERBOARD",
    yourRank: "YOUR_RANK",
    season: "SEASON",
    seasonEnds: "SEASON_ENDS",
    nextRank: "NEXT_RANK",
    challenges: "CHALLENGES",
    playerProfile: "PLAYER_PROFILE",
    rank: "RANK",
    shards: "SHARDS",
    level: "LEVEL",

    // Common
    loading: "LOADING",
    error: "ERROR",
    success: "SUCCESS",
    online: "ONLINE",
    offline: "OFFLINE",
    active: "ACTIVE",
    idle: "IDLE",
  },
  ru: {
    // Header
    title: "ДОБЫЧА ОСКОЛКОВ GIFT",
    subtitle: "ПРОТОКОЛ ГЛУБОКОЙ ДОБЫЧИ АКТИВЕН",
    operator: "ОПЕРАТОР",
    status: "СТАТУС",
    protocol: "ПРОТОКОЛ",
    platform: "ПЛАТФОРМА",

    // Mining
    shardsFound: "НАЙДЕНО_ОСКОЛКОВ",
    minerLevel: "УРОВЕНЬ_МАЙНЕРА",
    miningProtocol: "ПРОТОКОЛ_ДОБЫЧИ",
    timeRemaining: "ОСТАЛОСЬ_ВРЕМЕНИ",
    miningDepth: "ГЛУБИНА_ДОБЫЧИ",
    protocolActive: "ПРОТОКОЛ_АКТИВЕН",
    protocolIdle: "ПРОТОКОЛ_НЕАКТИВЕН",
    startMining: "НАЧАТЬ_ДОБЫЧУ",
    stopMining: "ОСТАНОВИТЬ_ДОБЫЧУ",
    collectShards: "СОБРАТЬ_ОСКОЛКИ",
    upgradeMiner: "УЛУЧШИТЬ_МАЙНЕР",
    useMainButton: "ИСПОЛЬЗУЙТЕ_ГЛАВНУЮ_КНОПКУ_ДЛЯ_УПРАВЛЕНИЯ",

    // User Profile Modal
    userProfile: "ПРОФИЛЬ_ПОЛЬЗОВАТЕЛЯ",
    accountType: "ТИП_АККАУНТА",
    premium: "ПРЕМИУМ",
    standard: "СТАНДАРТ",
    joinDate: "ДАТА_РЕГИСТРАЦИИ",
    systemInfo: "СИСТЕМНАЯ_ИНФОРМАЦИЯ",
    version: "ВЕРСИЯ",
    close: "ЗАКРЫТЬ",

    // Navigation
    mining: "ДОБЫЧА",
    wallet: "КОШЕЛЁК",
    tasks: "ЗАДАНИЯ",
    rating: "РЕЙТИНГ",

    // Wallet
    balance: "БАЛАНС",
    giftTokens: "ТОКЕНЫ_GIFT",
    showBalance: "ПОКАЗАТЬ_БАЛАНС",
    hideBalance: "СКРЫТЬ_БАЛАНС",
    send: "ОТПРАВИТЬ",
    receive: "ПОЛУЧИТЬ",
    transactionHistory: "ИСТОРИЯ_ТРАНЗАКЦИЙ",
    noTransactions: "ТРАНЗАКЦИЙ_ПОКА_НЕТ",
    sendTokens: "ОТПРАВИТЬ_ТОКЕНЫ",
    receiveTokens: "ПОЛУЧИТЬ_ТОКЕНЫ",
    recipientAddress: "АДРЕС_ПОЛУЧАТЕЛЯ",
    amount: "СУММА",
    cancel: "ОТМЕНА",
    confirm: "ПОДТВЕРДИТЬ",
    yourAddress: "ВАШ_АДРЕС",
    shareAddress: "ПОДЕЛИТЬСЯ_АДРЕСОМ",

    // Tasks
    dailyTasks: "ЕЖЕДНЕВНЫЕ_ЗАДАНИЯ",
    achievements: "ДОСТИЖЕНИЯ",
    social: "СОЦИАЛЬНЫЕ",
    allTasks: "ВСЕ_ЗАДАНИЯ",
    taskDetails: "ДЕТАЛИ_ЗАДАНИЯ",
    missionBriefing: "ОПИСАНИЕ_МИССИИ",
    progress: "ПРОГРЕСС",
    reward: "НАГРАДА",
    claim: "ПОЛУЧИТЬ",
    claimed: "ПОЛУЧЕНО",
    share: "ПОДЕЛИТЬСЯ",

    // Rating
    leaderboard: "ТАБЛИЦА_ЛИДЕРОВ",
    yourRank: "ВАШ_РАНГ",
    season: "СЕЗОН",
    seasonEnds: "СЕЗОН_ЗАКАНЧИВАЕТСЯ",
    nextRank: "СЛЕДУЮЩИЙ_РАНГ",
    challenges: "ВЫЗОВЫ",
    playerProfile: "ПРОФИЛЬ_ИГРОКА",
    rank: "РАНГ",
    shards: "ОСКОЛКИ",
    level: "УРОВЕНЬ",

    // Common
    loading: "ЗАГРУЗКА",
    error: "ОШИБКА",
    success: "УСПЕХ",
    online: "В_СЕТИ",
    offline: "НЕ_В_СЕТИ",
    active: "АКТИВЕН",
    idle: "НЕАКТИВЕН",
  },
}
