/*******************************************************
 * (A) 언어 매핑 : 원하는 언어 이름을 추가/수정
 *******************************************************/
const languageMap = {
    "python": "python",
    "Python": "python",
    "c": "c",
    "C": "c",
    "c++": "c++",
    "C++": "c++",
    "cpp": "c++",
    "CPP": "c++",
    "html": "html",
    "HTML": "html",
    "js": "js",
    "JS": "js",
    "javascript": "js",
    "JavaScript": "js",
    "react": "react",
    "React": "react",
    "md": "md",
    "MD": "md",
    "markdown": "md",
    "Markdown": "md",
  };
  
  /*******************************************************
   * (B) UTF-8 → Base64 변환 (한글, 이모지 등 모두 OK)
   *******************************************************/
  function encodeBase64(str) {
    const utf8Bytes = new TextEncoder().encode(str);
  
    let binary = "";
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    return btoa(binary);
  }
  
  /*******************************************************
   * (C) 팝업 표시 (composerParent 크기나 window 크기 기준)
   *******************************************************/
  function showPopup(langText, codeText) {
    // 혹시 기존 팝업 있으면 제거
    const existing = document.getElementById("code-runner-popup");
    if (existing) existing.remove();
  
    // (1) composerParent 찾기
    const composerParent = document.querySelector(
      'div.composer-parent.flex.flex-col.focus-visible\\:outline-0.h-full'
    );
  
    let parentWidth, parentHeight, offsetLeft, offsetTop;
    if (composerParent) {
      const rect = composerParent.getBoundingClientRect();
      parentWidth = rect.width;
      parentHeight = rect.height;
      offsetLeft = rect.left;
      offsetTop = rect.top;
    } else {
      // 없으면 window 기준
      parentWidth = window.innerWidth;
      parentHeight = window.innerHeight;
      offsetLeft = 0;
      offsetTop = 0;
      console.warn("composerParent not found => fallback to window size");
    }
  
    // (2) 팝업 크기: 50%x80%
    const popupWidth = parentWidth * 0.5;
    const popupHeight = parentHeight * 0.8;
  
    // 중앙 좌표
    const leftPos = offsetLeft + (parentWidth - popupWidth) / 2;
    const topPos = offsetTop + (parentHeight - popupHeight) / 2;
  
    // (3) 팝업 컨테이너
    const popup = document.createElement("div");
    popup.id = "code-runner-popup";
    popup.style.position = "fixed";
    popup.style.left = leftPos + "px";
    popup.style.top = topPos + "px";
    popup.style.width = popupWidth + "px";
    popup.style.height = popupHeight + "px";
    popup.style.backgroundColor = "#fff";
    popup.style.border = "2px solid #ccc";
    popup.style.zIndex = "999999";
    popup.style.borderRadius = "6px";
    popup.style.display = "flex";
    popup.style.flexDirection = "column";
  
    // (4) 상단 바 + 닫기(X) 버튼
    const titleBar = document.createElement("div");
    titleBar.style.height = "30px";
    titleBar.style.backgroundColor = "#f1f1f1";
    titleBar.style.display = "flex";
    titleBar.style.alignItems = "center";
    titleBar.style.justifyContent = "flex-end";
    titleBar.style.padding = "0 8px";
    titleBar.style.borderBottom = "1px solid #ccc";
  
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "X";
    closeBtn.style.border = "none";
    closeBtn.style.background = "transparent";
    closeBtn.style.fontSize = "16px";
    closeBtn.style.cursor = "pointer";
    closeBtn.addEventListener("click", () => popup.remove());
  
    titleBar.appendChild(closeBtn);
    popup.appendChild(titleBar);
  
    // (5) 내용 영역
    const contentArea = document.createElement("div");
    contentArea.style.flex = "1";
    contentArea.style.overflow = "hidden";
    popup.appendChild(contentArea);
  
    // (6) 언어 지원 여부 확인 → iframe or 안내문
    const mappedLang = languageMap[langText];
    if (!mappedLang) {
      // 미지원 언어
      const msg = document.createElement("div");
      msg.style.display = "flex";
      msg.style.alignItems = "center";
      msg.style.justifyContent = "center";
      msg.style.width = "100%";
      msg.style.height = "100%";
      msg.style.fontSize = "16px";
      msg.textContent = `The (${langText}) is not yet supported.`;
      contentArea.appendChild(msg);
    } else {
      // iframe
      const iframe = document.createElement("iframe");
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "none";
  
      const base64Code = encodeBase64(codeText);
      const runUrl = `https://dev.bloupla.net/run_code/${encodeURIComponent(mappedLang)}/#=${base64Code}`;
      iframe.src = runUrl;
  
      contentArea.appendChild(iframe);
    }
  
    document.body.appendChild(popup);
  }
  
  /*******************************************************
   * (D) 코드 블록에 "Run"이 먼저, "Copy" 뒤
   *     - Run 버튼 style에 height: 24px 추가
   *******************************************************/
  function addRunButtons() {
    // (1) <pre> 태그 중 class에 'overflow-visible!'이 들어간 것 + 자식 div.contain-inline-size
    const codeContainers = document.querySelectorAll(
      "pre[class*='overflow-visible!'] > div.contain-inline-size"
    );
  
    codeContainers.forEach((container) => {
      // (2) 언어 표시 div
      const langDiv = container.querySelector(
        "div.flex.items-center.text-token-text-secondary"
      );
      if (!langDiv) return;
      const langText = langDiv.textContent.trim();
  
      // (3) 코드 내용 code 태그
      const codeEl = container.querySelector("div.overflow-y-auto code");
      if (!codeEl) return;
      const codeText = codeEl.textContent || "";
  
      // (4) Copy 버튼이 들어있는 span
      const copySpan = container.querySelector("span[data-state]");
      if (!copySpan) return;
  
      // (5) Copy span의 부모 div
      const parentDiv = copySpan.parentElement;
      if (!parentDiv) return;
  
      // 중복 생성 방지
      const existingRunSpan = parentDiv.querySelector("span[data-run='true']");
      if (existingRunSpan) return;
  
      // (6) 새 <span> (Run용)
      const runSpan = document.createElement("span");
      runSpan.setAttribute("data-state", "closed");
      runSpan.setAttribute("data-run", "true");
  
      // (7) Run 버튼 생성
      const runBtn = document.createElement("button");
      runBtn.className = "flex gap-1 items-center select-none px-4 py-1";
      runBtn.setAttribute("aria-label", "Run");
  
      // **height: 24px** 추가
      runBtn.style.height = "24px";
  
      runBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
             xmlns="http://www.w3.org/2000/svg" class="icon-xs">
          <path d="M5 3l14 9-14 9V3z" fill="currentColor"></path>
        </svg>
        Run
      `;
  
      // 팝업 열기
      runBtn.addEventListener("click", () => {
        showPopup(langText, codeText);
      });
  
      runSpan.appendChild(runBtn);
  
      // (8) parentDiv에 runSpan을 copySpan 앞에 삽입 => Run 먼저, Copy 뒤
      parentDiv.insertBefore(runSpan, copySpan);
    });
  }
  
  /*******************************************************
   * (E) 0.5초마다 addRunButtons() 실행
   *******************************************************/
  setInterval(() => {
    addRunButtons();
  }, 500);
  