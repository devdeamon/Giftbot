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
  wallet: {
    title: string
    protocolActive: string
    accountBalance: string
    giftTokens: string
    walletActive: string
    walletEmpty: string
    shardsConverted: string
    sendTokens: string
    receiveTokens: string
    transactionHistory: string
    miningRewards: string
    noTransactions: string
    startMiningToEarn: string
    recipientAddress: string
    amount: string
    available: string
    executeTransfer: string
    yourWalletAddress: string
    copyAddress: string
    shareAddress: string
  }
  tasks: {
    title: string
    missionControlActive: string
    missionStatistics: string
    completed: string
    earned: string
    claimable: string
    all: string
    achievements: string
    mining: string
    completeMining: string
    completeMiningDesc: string
    shardCollector: string
    shardCollectorDesc: string
    minerUpgrade: string
    minerUpgradeDesc: string
    masterMiner: string
    masterMinerDesc: string
    difficulty: {
      easy: string
      medium: string
      hard: string
    }
    complete: string
    pending: string
    progress: string
    shards: string
    claimReward: string
    rewardClaimed: string
    viewDetails: string
    taskDetails: string
    missionBriefing: string
    rewardPackage: string
    giftShards: string
  }
  rating: {
    title: string
    leaderboardActive: string
    global: string
    level: string
    shards: string
    yourPosition: string
    progressToNext: string
    top10Miner: string
    top100Miner: string
    activeMiner: string
    topMiners: string
    season01: string
    you: string
    noRankingData: string
    startMiningToRank: string
    seasonInfo: string
    daysLeft: string
    activeMiners: string
    seasonRewards: string
    rank01: string
    rank02: string
    rank03: string
    top100: string
    legendaryBadge: string
    epicBadge: string
    rareBadge: string
    commonBadge: string
    competeForRewards: string
    operatorProfile: string
    miningStatistics: string
    globalRank: string
    shardsFound: string
    minerLevel: string
    totalMined: string
    joined: string
    unknownOperator: string
    supremeMiner: string
    eliteOperator: string
    veteranMiner: string
    skilledOperator: string
    apprenticeMiner: string
    rookieOperator: string
  }

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
    wallet: {
      title: "DIGITAL WALLET",
      protocolActive: "FINANCIAL PROTOCOL ACTIVE",
      accountBalance: "ACCOUNT_BALANCE",
      giftTokens: "GIFT_TOKENS",
      walletActive: "WALLET_ACTIVE",
      walletEmpty: "WALLET_EMPTY",
      shardsConverted: "SHARDS_CONVERTED",
      sendTokens: "SEND_TOKENS",
      receiveTokens: "RECEIVE_TOKENS",
      transactionHistory: "TRANSACTION_HISTORY",
      miningRewards: "Mining rewards earned",
      noTransactions: "NO_TRANSACTIONS_FOUND",
      startMiningToEarn: "START_MINING_TO_EARN_TOKENS",
      recipientAddress: "RECIPIENT_ADDRESS",
      amount: "AMOUNT",
      available: "AVAILABLE",
      executeTransfer: "EXECUTE_TRANSFER",
      yourWalletAddress: "YOUR_WALLET_ADDRESS",
      copyAddress: "COPY_ADDRESS",
      shareAddress: "SHARE_THIS_ADDRESS_TO_RECEIVE_TOKENS",
    },
    tasks: {
      title: "TASK PROTOCOL",
      missionControlActive: "MISSION CONTROL ACTIVE",
      missionStatistics: "MISSION_STATISTICS",
      completed: "COMPLETED",
      earned: "EARNED",
      claimable: "CLAIMABLE",
      all: "ALL",
      achievements: "ACHIEVE",
      mining: "MINING",
      completeMining: "COMPLETE_MINING",
      completeMiningDesc: "Complete one full mining session",
      shardCollector: "SHARD_COLLECTOR",
      shardCollectorDesc: "Collect your first 10 GIFT shards",
      minerUpgrade: "MINER_UPGRADE",
      minerUpgradeDesc: "Upgrade your miner to level 3",
      masterMiner: "MASTER_MINER",
      masterMinerDesc: "Reach miner level 10",
      difficulty: {
        easy: "EASY",
        medium: "MEDIUM",
        hard: "HARD",
      },
      complete: "COMPLETE",
      pending: "PENDING",
      progress: "PROGRESS",
      shards: "SHARDS",
      claimReward: "CLAIM_REWARD",
      rewardClaimed: "REWARD_CLAIMED",
      viewDetails: "VIEW_DETAILS",
      taskDetails: "TASK_DETAILS",
      missionBriefing: "MISSION_BRIEFING",
      rewardPackage: "REWARD_PACKAGE",
      giftShards: "GIFT_SHARDS",
    },
    rating: {
      title: "GLOBAL RATING",
      leaderboardActive: "LEADERBOARD PROTOCOL ACTIVE",
      global: "GLOBAL",
      level: "LEVEL",
      shards: "SHARDS",
      yourPosition: "YOUR_POSITION",
      progressToNext: "PROGRESS_TO_NEXT_RANK",
      top10Miner: "TOP_10_MINER",
      top100Miner: "TOP_100_MINER",
      activeMiner: "ACTIVE_MINER",
      topMiners: "TOP_MINERS",
      season01: "SEASON_01",
      you: "YOU",
      noRankingData: "NO_RANKING_DATA",
      startMiningToRank: "START_MINING_TO_GET_RANKED",
      seasonInfo: "SEASON_INFORMATION",
      daysLeft: "DAYS_LEFT",
      activeMiners: "ACTIVE_MINERS",
      seasonRewards: "SEASON_REWARDS",
      rank01: "RANK_01",
      rank02: "RANK_02-03",
      rank03: "RANK_04-10",
      top100: "TOP_100",
      legendaryBadge: "LEGENDARY_BADGE",
      epicBadge: "EPIC_BADGE",
      rareBadge: "RARE_BADGE",
      commonBadge: "COMMON_BADGE",
      competeForRewards: "COMPETE_FOR_EXCLUSIVE_SEASON_REWARDS",
      operatorProfile: "OPERATOR_PROFILE",
      miningStatistics: "MINING_STATISTICS",
      globalRank: "GLOBAL_RANK",
      shardsFound: "SHARDS_FOUND",
      minerLevel: "MINER_LEVEL",
      totalMined: "TOTAL_MINED",
      joined: "JOINED",
      unknownOperator: "UNKNOWN_OPERATOR",
      supremeMiner: "SUPREME_MINER",
      eliteOperator: "ELITE_OPERATOR",
      veteranMiner: "VETERAN_MINER",
      skilledOperator: "SKILLED_OPERATOR",
      apprenticeMiner: "APPRENTICE_MINER",
      rookieOperator: "ROOKIE_OPERATOR",
    },

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
    // shareAddress: "SHARE_ADDRESS", // Removed as it's duplicated in wallet object

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
    wallet: {
      title: "ЦИФРОВОЙ КОШЕЛЁК",
      protocolActive: "ФИНАНСОВЫЙ ПРОТОКОЛ АКТИВЕН",
      accountBalance: "БАЛАНС_СЧЁТА",
      giftTokens: "ТОКЕНЫ_GIFT",
      walletActive: "КОШЕЛЁК_АКТИВЕН",
      walletEmpty: "КОШЕЛЁК_ПУСТ",
      shardsConverted: "ОСКОЛКОВ_КОНВЕРТИРОВАНО",
      sendTokens: "ОТПРАВИТЬ_ТОКЕНЫ",
      receiveTokens: "ПОЛУЧИТЬ_ТОКЕНЫ",
      transactionHistory: "ИСТОРИЯ_ТРАНЗАКЦИЙ",
      miningRewards: "Награды за майнинг получены",
      noTransactions: "ТРАНЗАКЦИЙ_НЕ_НАЙДЕНО",
      startMiningToEarn: "НАЧНИТЕ_МАЙНИНГ_ЧТОБЫ_ЗАРАБОТАТЬ_ТОКЕНЫ",
      recipientAddress: "АДРЕС_ПОЛУЧАТЕЛЯ",
      amount: "СУММА",
      available: "ДОСТУПНО",
      executeTransfer: "ВЫПОЛНИТЬ_ПЕРЕВОД",
      yourWalletAddress: "ВАШ_АДРЕС_КОШЕЛЬКА",
      copyAddress: "КОПИРОВАТЬ_АДРЕС",
      shareAddress: "ПОДЕЛИТЕСЬ_ЭТИМ_АДРЕСОМ_ДЛЯ_ПОЛУЧЕНИЯ_ТОКЕНОВ",
    },
    tasks: {
      title: "ПРОТОКОЛ ЗАДАНИЙ",
      missionControlActive: "ЦЕНТР УПРАВЛЕНИЯ МИССИЯМИ АКТИВЕН",
      missionStatistics: "СТАТИСТИКА_МИССИЙ",
      completed: "ВЫПОЛНЕНО",
      earned: "ЗАРАБОТАНО",
      claimable: "ДОСТУПНО",
      all: "ВСЕ",
      achievements: "ДОСТИЖЕНИЯ",
      mining: "МАЙНИНГ",
      completeMining: "ЗАВЕРШИТЬ_МАЙНИНГ",
      completeMiningDesc: "Завершите одну полную сессию майнинга",
      shardCollector: "СБОРЩИК_ОСКОЛКОВ",
      shardCollectorDesc: "Соберите первые 10 осколков GIFT",
      minerUpgrade: "УЛУЧШЕНИЕ_МАЙНЕРА",
      minerUpgradeDesc: "Улучшите майнер до 3 уровня",
      masterMiner: "МАСТЕР_МАЙНЕР",
      masterMinerDesc: "Достигните 10 уровня майнера",
      difficulty: {
        easy: "ЛЁГКИЙ",
        medium: "СРЕДНИЙ",
        hard: "СЛОЖНЫЙ",
      },
      complete: "ВЫПОЛНЕНО",
      pending: "ОЖИДАНИЕ",
      progress: "ПРОГРЕСС",
      shards: "ОСКОЛКИ",
      claimReward: "ПОЛУЧИТЬ_НАГРАДУ",
      rewardClaimed: "НАГРАДА_ПОЛУЧЕНА",
      viewDetails: "ПОДРОБНОСТИ",
      taskDetails: "ДЕТАЛИ_ЗАДАНИЯ",
      missionBriefing: "ОПИСАНИЕ_МИССИИ",
      rewardPackage: "ПАКЕТ_НАГРАД",
      giftShards: "ОСКОЛКИ_GIFT",
    },
    rating: {
      title: "ГЛОБАЛЬНЫЙ РЕЙТИНГ",
      leaderboardActive: "ПРОТОКОЛ ТАБЛИЦЫ ЛИДЕРОВ АКТИВЕН",
      global: "ГЛОБАЛЬНЫЙ",
      level: "УРОВЕНЬ",
      shards: "ОСКОЛКИ",
      yourPosition: "ВАША_ПОЗИЦИЯ",
      progressToNext: "ПРОГРЕСС_ДО_СЛЕДУЮЩЕГО_РАНГА",
      top10Miner: "ТОП_10_МАЙНЕР",
      top100Miner: "ТОП_100_МАЙНЕР",
      activeMiner: "АКТИВНЫЙ_МАЙНЕР",
      topMiners: "ЛУЧШИЕ_МАЙНЕРЫ",
      season01: "СЕЗОН_01",
      you: "ВЫ",
      noRankingData: "НЕТ_ДАННЫХ_РЕЙТИНГА",
      startMiningToRank: "НАЧНИТЕ_МАЙНИНГ_ЧТОБЫ_ПОПАСТЬ_В_РЕЙТИНГ",
      seasonInfo: "ИНФОРМАЦИЯ_О_СЕЗОНЕ",
      daysLeft: "ДНЕЙ_ОСТАЛОСЬ",
      activeMiners: "АКТИВНЫХ_МАЙНЕРОВ",
      seasonRewards: "НАГРАДЫ_СЕЗОНА",
      rank01: "РАНГ_01",
      rank02: "РАНГ_02-03",
      rank03: "РАНГ_04-10",
      top100: "ТОП_100",
      legendaryBadge: "ЛЕГЕНДАРНЫЙ_ЗНАЧОК",
      epicBadge: "ЭПИЧЕСКИЙ_ЗНАЧОК",
      rareBadge: "РЕДКИЙ_ЗНАЧОК",
      commonBadge: "ОБЫЧНЫЙ_ЗНАЧОК",
      competeForRewards: "СОРЕВНУЙТЕСЬ_ЗА_ЭКСКЛЮЗИВНЫЕ_НАГРАДЫ_СЕЗОНА",
      operatorProfile: "ПРОФИЛЬ_ОПЕРАТОРА",
      miningStatistics: "СТАТИСТИКА_МАЙНИНГА",
      globalRank: "ГЛОБАЛЬНЫЙ_РАНГ",
      shardsFound: "НАЙДЕНО_ОСКОЛКОВ",
      minerLevel: "УРОВЕНЬ_МАЙНЕРА",
      totalMined: "ВСЕГО_ДОБЫТО",
      joined: "ПРИСОЕДИНИЛСЯ",
      unknownOperator: "НЕИЗВЕСТНЫЙ_ОПЕРАТОР",
      supremeMiner: "ВЕРХОВНЫЙ_МАЙНЕР",
      eliteOperator: "ЭЛИТНЫЙ_ОПЕРАТОР",
      veteranMiner: "ВЕТЕРАН_МАЙНЕР",
      skilledOperator: "ОПЫТНЫЙ_ОПЕРАТОР",
      apprenticeMiner: "УЧЕНИК_МАЙНЕР",
      rookieOperator: "НОВИЧОК_ОПЕРАТОР",
    },

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
    // shareAddress: "ПОДЕЛИТЬСЯ_АДРЕСОМ", // Removed as it's duplicated in wallet object

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
