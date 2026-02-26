const SSO_ME_URL = 'https://sso.lanny.dev/@me';
const SSO_LOGIN_URL = 'https://sso.lanny.dev/?close';

const states = {
    LOGIN: 'login',
    LOADING: 'loading',
    LOGGED_IN: 'loggedIn',
};

const setButtonState = (btn, state) => {
    if (!btn) return;

    btn.classList.remove('is-loading');
    btn.disabled = false;

    if (state === states.LOADING) {
        btn.textContent = 'LOGGING IN';
        btn.disabled = true;
        btn.classList.add('is-loading');
        return;
    }

    if (state === states.LOGGED_IN) {
        btn.innerHTML = `
            <a class="user-link">
                <span class="user-avatar">
                    <img src="${ssoUser.photo_url}" />
                </span>
                <span class="user-meta">
                    <span class="user-name">@${ssoUser.username || 'unknown'}</span>
                    <span class="user-sub">ID: ${ssoUser.telegram_id}</span>
                </span>
            </a>
        `;
        btn.disabled = true;
        return;
    }

    btn.textContent = 'login';
};

const fetchMe = async () => {
    const res = await fetch(SSO_ME_URL, { credentials: 'include' });
    if (!res.ok) return null;
    return res.json();
};

const initAuth = async () => {
    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) return;

    setButtonState(loginBtn, states.LOADING);

    try {
        const me = await fetchMe();
        if (me) {
            window.ssoUser = me;
            setButtonState(loginBtn, states.LOGGED_IN);
        } else {
            setButtonState(loginBtn, states.LOGIN);
        }
    } catch {
        setButtonState(loginBtn, states.LOGIN);
    }

    loginBtn.addEventListener('click', () => {
        if (loginBtn.disabled) return;

        setButtonState(loginBtn, states.LOADING);

        const popup = window.open(SSO_LOGIN_URL, 'ssoLogin', 'width=500,height=600');
        if (!popup) {
            setButtonState(loginBtn, states.LOGIN);
            return;
        }

        const poll = setInterval(async () => {
            if (!popup.closed) return;

            clearInterval(poll);
            try {
                const me = await fetchMe();
                if (me) {
                    window.ssoUser = me;
                    setButtonState(loginBtn, states.LOGGED_IN);
                } else {
                    setButtonState(loginBtn, states.LOGIN);
                }
            } catch {
                setButtonState(loginBtn, states.LOGIN);
            }
        }, 500);
    });
};

document.addEventListener('DOMContentLoaded', initAuth);

