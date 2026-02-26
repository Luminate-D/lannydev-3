const SSO_ME_URL = 'https://sso.lanny.dev/@me';
const SSO_LOGIN_URL = 'https://sso.lanny.dev/?close';

const states = {
    LOGIN: 'login',
    LOADING: 'loading',
    LOGGED_IN: 'loggedIn',
};

const setUserCard = (me) => {
    const card = document.getElementById('userCard');
    const loginBtn = document.getElementById('loginBtn');
    if (!card || !loginBtn) return;

    if (!me) {
        card.hidden = true;
        loginBtn.hidden = false;
        return;
    }

    document.getElementById('userAvatar').src = me.photo_url || '';
    document.getElementById('userName').textContent = `@${me.username || 'unknown'}`;
    document.getElementById('userSub').textContent = `ID: ${me.telegram_id}`;
    card.hidden = false;
    loginBtn.hidden = true;
};

const setButtonState = (btn, state) => {
    if (!btn) return;

    btn.classList.remove('is-loading', 'is-logged-in');
    btn.disabled = false;

    if (state === states.LOADING) {
        btn.textContent = 'logging in...';
        btn.disabled = true;
        btn.classList.add('is-loading');
        return;
    }

    if (state === states.LOGGED_IN) {
        btn.disabled = true;
        btn.classList.add('is-logged-in');
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
            setUserCard(me);
            setButtonState(loginBtn, states.LOGGED_IN);
        } else {
            setUserCard(null);
            setButtonState(loginBtn, states.LOGIN);
        }
    } catch {
        setUserCard(null);
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
                    setUserCard(me);
                    setButtonState(loginBtn, states.LOGGED_IN);
                } else {
                    setUserCard(null);
                    setButtonState(loginBtn, states.LOGIN);
                }
            } catch {
                setUserCard(null);
                setButtonState(loginBtn, states.LOGIN);
            }
        }, 500);
    });
};

document.addEventListener('DOMContentLoaded', initAuth);
