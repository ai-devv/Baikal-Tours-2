export {
    validatePhone,
    validateMail,
    isMobile
}

function validatePhone(e) {
    if (
        !(
            (e.key >= "0" && e.key <= "9") ||
            e.key == "+" ||
            e.key == "(" ||
            e.key == ")" ||
            e.key == "-" ||
            e.key == "ArrowLeft" ||
            e.key == "ArrowRight" ||
            e.key == "Delete" ||
            e.key == "Backspace" ||
            e.key == "Tab"
        )
    ) e.preventDefault();
}

function validateMail(mail){
    mail = mail.trim();
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(mail).toLowerCase());
}

function isMobile(param){
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(param);
}