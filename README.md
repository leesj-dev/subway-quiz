# 지하철 노선도 퀴즈
수도권 및 부산 지하철 노선도를 보고 역 이름과 그 역이 속한 호선을 맞히는 퀴즈.

## 가. 수도권 전체 노선 <sub>[링크](https://leesj.me/subway-quiz/seoul)</sub>

### A. 이용방법

1. 제한시간을 지정해주세요. '-', '+' 버튼을 이용하여 1분 단위로 조절하거나, 분(minute) 영역을 클릭하여 직접 입력할 수 있습니다. 최소 1분, 최대 99분까지 지정할 수 있습니다.
2. '시작' 버튼을 눌러 퀴즈를 시작합니다.
3. 노선도 아래에 위치한 호선을 먼저 선택하고, 그 호선에 속한 역 이름을 입력합니다. Enter 키를 누르거나, '제출' 버튼을 눌러 답을 맞히면 점수가 올라갑니다.
4. 노선도는 우하단에 있는 +/- 버튼뿐만 아니라 핀치하여 확대, 마우스 휠로 확대, 드래그 등의 제스처를 지원합니다. 초기 상태로 돌아가고 싶을 때는 RESET 버튼을 누르면 됩니다.
5. 제한시간이 끝나거나, '포기' 버튼을 누르면 게임이 종료되며 맞히지 못한 역명이 표시됩니다. 최고기록을 달성할 시 HIGH SCORE에 갱신됩니다. 제한시간 안에 모든 문제를 맞히면 'COMPLETE'가 표시되며 게임이 종료됩니다.
6. 유저의 편의를 위해 아래의 설정을 조작할 수 있습니다.
- **투명도**: 게임 시작 이후 노선을 선택할 때, 선택한 노선만 강조하여 볼 수 있도록 투명도를 조절할 수 있습니다.
- **역 눈금 표시**: 게임 시작 이전 역의 위치를 표시하는 눈금을 표시하거나 숨길 수 있습니다. <u>이 옵션은 게임 시작 전에만 변경할 수 있습니다.</u>
- **환승역 타 노선 색 표시**: 노선을 선택할 때, 환승역에 있는 타 노선 색깔도 선택한 노선으로 간주할지 말지 정합니다. 이 옵션을 활성화하면 '선택한 노선의 환승역에 있는 타 노선 색'의 투명도는 100%가 되며, 비활성화하면 '선택하지 않은 노선들'과 동일한 투명도를 갖게 됩니다.
- **노선 클릭 시 확대**: 노선을 선택할 때 해당 노선만 확대하여 볼지 정합니다.
  
### B. 업데이트 내역

#### 2024.12.28. | v0.5.5
- 2024년 10월 31일 당고개역이 불암산역으로 역명 변경된 사항을 반영하였습니다.

#### 2024.08.18. | v0.5.4
- 2024년 8월 10일 개통된 8호선 별내~암사 구간을 반영하였습니다.

#### 2024.06.30. | v0.5.3
- 2024년 6월 29일 개통된 GTX-A 구성역을 반영하였습니다.

#### 2024.05.13. | v0.5.2
- CSS를 일부 수정하고 JS 코드를 보기 에쁘게 다듬었습니다.

#### 2024.04.20. | v0.5.1
- HTML, JS 코드를 보기 에쁘게 다듬고 클린 코드화하였습니다.
  
#### 2024.04.16. | v0.5.0
- 2024년 3월 30일 개통된 GTX-A 수서~동탄 구간 및 경강선 성남역을 반영하였습니다.
- 2024년 1월 29일 운동장·송담대역이 용인중앙시장역으로 역명 변경된 사항을 반영하였습니다.
- 우측 프로그레스 탭의 글자 크기가 화면 해상도에 따라 다르게 보이는 문제를 수정하였습니다.

#### 2024.03.02. | v0.4.8
- 2024년 2월 29일 뚝섬유원지역이 자양역으로 역명 변경된 사항을 반영하였습니다. 

#### 2024.02.18. | v0.4.7
- 2023년 8월 26일 개통된 서해선 일산~대곡 구간에 있는 역들이 서해선을 선택하였을 때 입력되지 않는 현상을 수정하였습니다.
- 2023년 11월 21일 화전역이 한국항공대역으로 역명 변경된 사항을 반영하였습니다.
- 2022년 12월 17일 부로 도라산역이 영업중단됨에 따라, 경의중앙선 총 역 개수는 56개이지만 영업중인 역 개수는 55개입니다. 현 노선도에서는 도라산역을 포함하고 있지 않음에 따라 경의중앙선의 역 개수를 55개로 수정하였습니다. 더불어 수도권 전철 역의 총 개수를 645에서 644개로 수정하였습니다.
- 초지역 위치의 가시성을 확보하기 위해 역의 위치를 조정하였습니다.

#### 2024.02.01. | v0.4.6
- '정답', '오답', '다시 제출' 등으로 뜨는 팝업 상자의 크기가 모바일에서 맞지 않는 오류를 수정하였습니다.

#### 2024.01.31. | v0.4.5
- 터치 제스처를 지원하는 기존 모듈(hammer.js)을 제거하고 svg-pan-zoom 라이브러리 내에서 처리하도록 변경하였습니다.
- 웹페이지의 요소 간 간격 및 크기 등을 조정하였습니다.
- 화면 크기 조절 시 노선도 크기 조절 아이콘이 재로딩되는 버그를 해결하였습니다.

#### 2024.01.30. | v0.4.4
- 2023년 12월 16일 개통된 1호선 연천~소요산 구간의 개통을 반영하였습니다.
- 현재 쓰이지 않는 Google Tag Manager와 관련된 스크립트를 제거하였습니다.
- 웹피이지 캐싱으로 인한 업데이트 누락을 방지하기 위한 조치를 취하였습니다.
  
#### 2024.01.23. | v0.4.3
- Pretendard 폰트의 ss05 subset을 적용하여 보다 더 깔끔한 디자인으로 변경하였습니다.
- 정답 개수를 나타내는 숫자를 고정폭으로 변경하여 시인성을 확보하였습니다.
- 시간의 분 설정을 직접 입력하여 변경할 수 있도록 수정하였습니다.

#### 2024.01.13. | v0.4.2
- 노선도 크기를 조절하는 아이콘들을 예쁘게 다듬고 아이콘을 불러오는 로직을 일부 변경하였습니다.
- 회기역이 노선도 상에서 실수로 누락된 것을 수정하였습니다.

#### 2024.01.08. | v0.4.1
- 여러 가지 화면 해상도에서 노선도가 잘 보이도록 조정하였습니다.
- 화면 크기가 너무 작거나 비율이 맞지 않을 때 게임 진행에 어려움이 있어, 해당 경우에는 게임을 진행할 수 없도록 수정하고 화면 크기 조절 안내 메세지를 띄우도록 변경하였습니다.
- CSS의 리팩토링을 진행하였습니다.

#### 2024.01.03. | v0.4.0
- hammer.js 라이브러리를 통해 지도 내 터치 제스처를 지원하도록 하였습니다.
- 가운뎃점(·)이 있는 역명의 경우 입력의 불편함을 해소하기 위해 가운뎃점을 생략하여 입력하거나 온점(.)으로 대신하여 입력하여도 정답으로 인정하도록 수정하였습니다.
- 노선도 내 폰트가 모든 기기에서 Pretendard로 보이지 않는 현상을 수정하였습니다. 
- 호선 선택 시의 투명도 변경 로직과 관련된 버그를 수정하였습니다.
- 게임 리셋 시 호선별 점수가 초기화되지 않는 버그를 수정하였습니다.
- 지선 환승역 입력 시 호선별 점수에서 이중으로 점수가 올라가는 버그를 수정하였습니다.
- HTML 내 요소들의 배치를 조정하였습니다.

<br>

## 나. 부산 전체 노선 <sub>[링크](https://leesj.me/subway-quiz/busan)</sub>

### A. 이용방법
1. 제한시간을 지정해주세요. '-', '+' 버튼을 이용하여 1분 단위로 조절할 수 있습니다. 최소 1분, 최대 60분까지 지정할 수 있습니다.
2. '시작' 버튼을 눌러 퀴즈를 시작합니다.
3. 노선도 아래에 위치한 호선을 먼저 선택하고, 그 호선에 속한 역 이름을 입력합니다. Enter 키를 누르거나, '제출' 버튼을 눌러 답을 맞히면 점수가 올라갑니다.
4. 제한시간이 끝나거나, '포기' 버튼을 누르면 게임이 종료되며 맞히지 못한 역명이 표시됩니다. 최고기록을 달성할 시 HIGH SCORE에 갱신됩니다. 제한시간 안에 모든 문제를 맞히면 'COMPLETE'가 표시되며 게임이 종료됩니다.

<br>

## 다. 수도권 개별 노선 <sub>[2호선](https://leesj.me/subway-quiz/seoul-individual/2) [3호선](https://leesj.me/subway-quiz/seoul-individual/3)</sub>

### A. 이용방법

1. 제한시간을 지정해주세요. '-', '+' 버튼을 이용하여 1분 단위로 조절할 수 있습니다. 최소 1분, 최대 60분까지 지정할 수 있습니다.
2. '시작' 버튼을 눌러 퀴즈를 시작합니다.
3. 해당 호선에 속한 역 이름을 입력합니다. Enter 키를 누르거나, '제출' 버튼을 눌러 답을 맞히면 점수가 올라갑니다.
4. 제한시간이 끝나거나, '포기' 버튼을 누르면 게임이 종료되며 맞히지 못한 역명이 표시됩니다. 최고기록을 달성할 시 HIGH SCORE에 갱신됩니다. 제한시간 안에 모든 문제를 맞히면 'COMPLETE'가 표시되며 게임이 종료됩니다.