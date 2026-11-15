---
title: "D3 午休"
subtitle: "7月30日（三） · 人类与兽人"
---

::: {.day-pager aria-label="页首切换午休" role="navigation" data-page-lookup="从午休开始"}
[← D2](d2-lunch.md){.day-previous aria-label="上一个午休 D2"} [<span class="bi bi-calendar3" aria-hidden="true"></span> 午休日历](lunch-calendar.md){.day-directory} [D4 →](d4-lunch.md){.day-next aria-label="下一个午休 D4"}
:::

::: {.guide-jumps aria-label="午休导航" role="navigation"}
[返回 D3 日期页](d3.md#lunch) [选完怎么补](#revisit) [GP 的加减规则](../mechanics/gp.md#balance)
:::

```{=html}
<nav class="lunch-places" aria-label="有选项、成就或前置的地点">
  <a href="#site-upper">
    <strong>现场上层</strong>
    <span>中央偏上 · 文治 · 2 项</span>
    <small>闻气味 −16 GP · 成就</small>
  </a>
  <a href="#guardroom">
    <strong>值班室</strong>
    <span>左下 · 笹吉 · 2 项</span>
    <small>两项免费，GP 不同</small>
  </a>
  <a href="#restroom">
    <strong>厕所</strong>
    <span>左下偏中 · 斗次郎</span>
    <small>自动成就 · 地点奖 +8 GP</small>
  </a>
  <a href="#gate">
    <strong>大门前</strong>
    <span>最右侧 · 狸丸</span>
    <small>在场时可补番外前置 · +8 GP</small>
  </a>
</nav>
```

时间线选「从午休开始」。上层和值班室各有 **+8 GP** 地点奖，读完到账，和选项的 GP 分开算。

## [现场上层]{.lookup-name} {#site-upper data-lookup="工地上层 文治 中央偏上"}

中央偏上 · 文治 · 地点奖 **+8 GP**

::: {.choice-list data-place="现场上层"}
::: {#heatstroke .choice-row data-lookup="详细询问关于中暑的事 文治"}
[详细问中暑]{.lookup-name} [+4 GP]{.gp-in}

听文治讲中暑的征兆和应对。
:::

::: {#smell-bunji .choice-row data-lookup="闻闻文治身上的味道 闻了闻文治身上的味道 闻了文治的气味 #291"}
[闻文治的味道]{.lookup-name} [−16 GP]{.gp-out}

靠近文治后登记成就「[闻了文治的气味](../collectibles/achievements.md#a291){.achievement-ref}」。若地点奖还没领，也要先有 16 GP 才能按标价解锁，读完再领 8 GP。
:::
:::

## [值班室]{.lookup-name} {#guardroom data-lookup="工棚 笹吉 左下"}

左下 · 笹吉 · 地点奖 **+8 GP**

### 啊，还是喜欢叔叔这种胖的？ {#sakichi-question}

::: {.choice-list data-place="值班室"}
::: {#like-sakichi .choice-row data-lookup="笹吉 肚子"}
[是的]{.lookup-name} [+6 GP]{.gp-in}

笹吉让主角摸了摸他的肚子。
:::

::: {#other-taste .choice-row data-lookup="那倒不是 笹吉 肚子"}
[不是]{.lookup-name} [+4 GP]{.gp-in}

主角说更喜欢肌肉，笹吉接受他的回答。两项都接到关于其他兽人的对话。
:::
:::

## [厕所]{.lookup-name} {#restroom data-lookup="左下偏中 斗次郎 在厕所里吓到了斗次郎 在厕所里吓了斗次郎一跳 #292"}

左下偏中 · 斗次郎 · 地点奖 **+8 GP**

::: {.event-record}
主角在厕所吓到斗次郎，剧情中自动登记成就「[在厕所里吓到了斗次郎](../collectibles/achievements.md#a292){.achievement-ref}」。继续读到收尾，再领地点奖。
:::

## [大门前]{.lookup-name} {#gate data-lookup="最右侧 狸丸 狸丸的秘密 #256 前置"}

最右侧 · 狸丸

::: {.event-record}
狸丸在场时，主角会问他是不是岛上的兽人。把对白读到收尾可领 **+8 GP**，这次拜访也会计入「狸丸的秘密」的前置。

若狸丸已经离开，这里会回午休地图，0 GP，也无法补这次拜访。[番外入口的显示条件](../mechanics/timeline.md#percent)
:::

<details class="kt-read-more">
<summary>其他三处 · 现场下层、事务所各 +8 GP，材料存放处记完成度</summary>

::: {.choice-list}
::: {#site-lower .choice-row data-lookup="工地下层 熊手 偏右下"}
[现场下层]{.lookup-name} [+8 GP]{.gp-in}

偏右下。熊手在看施工开口的收边，也聊到旧友。
:::

::: {#office .choice-row data-lookup="办公室 监督 防暑糖 左侧"}
[事务所]{.lookup-name} [+8 GP]{.gp-in}

左侧靠边。监督介绍防暑糖，也聊现场监督的工作。
:::

::: {#materials .choice-row data-lookup="材料堆放处 空地点 右下"}
[材料存放处]{.lookup-name}

右下。没人，记地点完成度并返回地图，0 GP。
:::
:::

</details>

## 选完后怎么补 {#revisit}

- 平常的午休里，有人在的地点读完会接下午工作，空地点会回地图。离开后可从[「从午休开始」](../mechanics/timeline.md#back-to-d3)再进。
- 解锁[「无限午休功能」](../mechanics/gp.md#features)后，读完可以回地图继续逛，结束时点右侧箭头。补文治或笹吉的另一项时，选项奖和已登记的地点奖各按自己的记录结算。

::: {.day-pager .day-pager-footer aria-label="页尾切换午休" role="navigation"}
[← D2](d2-lunch.md){.day-previous aria-label="上一个午休 D2"} [<span class="bi bi-calendar3" aria-hidden="true"></span> 午休日历](lunch-calendar.md){.day-directory} [D4 →](d4-lunch.md){.day-next aria-label="下一个午休 D4"}
:::
