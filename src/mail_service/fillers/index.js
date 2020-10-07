import { ticket, ticketsTable, ticketsBlock, mailing, ticketsCategory, ticketData,
        totalBlock, allTicketsTable, eventCard, subjectTable} from "./components";

import dateToString from "/helpers/dateToString";

export default {
    payment,
    eventRegistration,
    registration,
    newPassword,
    successWithdraw,
    rejectedWithdraw,
    secondEvent,
    reservationNotification,
    digest
}

function payment(template, text, data) {

    // text = {
    //     header:             "Спасибо за ваш заказ",
    //     orderHeader:        "Ваш заказ",
    //     greeting:           "Здравствуйте, {name}",
    //     message:            "Вы зарегистрировались на событие. Подтверждаем, что Ваша регистрация прошла успешно.",
    //     userData:           "Ваши данные",
    //     fullName:           "Имя Фамилия",
    //     phone:              "Телефон",
    //     mailingText:        "Вы получаете новостную рассылку, потому что вы подписались на нашу рассылку через:",
    //     disabledMailing:    "Отказаться от подписки",
    //     ticketsHeader:      "Билеты",
    //     additionalsHeader:  "Дополнительно",
    //     eventInfo:          "Информация о событии",
    //     eName:              "Название",
    //     location:           "Место проведения",
    //     eDate:              "Дата и время",
    //     goToSite:           "Перейти на сайт",
    //     disableLink:        "Если у вас не работает кнопка “Перейти на сайт”, скопируйте данную ссылку и откройте в браузере:",
    //     total:              "Итого",
    //     orderTitle:         "Номер заказа:"
    // }

    // data = {
    //     date:               "Понедельник, 20 июля 2020 г. , 8:00",
    //     name:               "Максим Жуков",
    //     userPhone:          "882281488",
    //     userEmail:          "test@mail.com",
    //     orderId:            "123456",
    //     buyable: [
    //         {
    //             type:       "ticket",
    //             price:       1000,
    //             count:       2,
    //             name:       "Детский"
    //         },
    //         {
    //             type:       "additional",
    //             price:       500,
    //             count:       1,
    //             name:       "Крутой"
    //         }
    //     ],
    //     eventName:          "Веревочные соревнования среди взрослых и детей в Вуки-Парк",
    //     eventLocation:      ["г.Байкальск, горнолыжный курорт “Гора Соболинная”"],
    //     domain:             "https://baikal.events",
    //     _
    // }

    data.eventLocations = data.eventLocations.join("<br>");

    return setData(setTicketsTable(template, text, data), { ...text, ...data });
}

function eventRegistration(template, text, data) {

    // text = {
    //     header:             "Спасибо за регистрацию!",
    //     greeting:           "Здравствуйте, {userName}",
    //     successRegister:    "Вы зарегистрировались на событие. Подтверждаем, что Ваша регистрация прошла успешно.",
    //     eventInfo:          "Информация о событии",
    //     name:               "Название",
    //     location:           "Место проведения",
    //     date:               "Дата и время",
    //     goToSite:           "Перейти на сайт",
    //     disableLink:        "Если у вас не работает кнопка “Перейти на сайт”, скопируйте данную ссылку и откройте в браузере:",
    //     mailingText:        "Вы получаете новостную рассылку, потому что вы подписались на нашу рассылку через:",
    //     disabledMailing:     "Отказаться от подписки"
    // }

    // data = {
    //     userName:           "Анастасия Захарова",
    //     eventName:          "Веревочные соревнования среди взрослых и детей в Вуки-Пар",
    //     eventLocation:      "г.Байкальск, горнолыжный курорт “Гора Соболинная”",
    //     eventDate:          "с 1 октября - по 30 сентября",
    //     domain:             "https://baikal.events"
    // }

    data.eventLocations = data.eventLocations.join("<br>");

    return setData(template, { ...text, ...data });
}

function registration(template, text, data) {

    // text = {
    //     header:             "Вы зарегистрированы!",
    //     greeting:           "Здравствуйте",
    //     successRegister:    "Благодарим вас за регистрацию на сайте. Очень рекомедуем сохранить это сообщение. Ваши данные для входа:",
    //     password:           "Пароль",
    //     goToSite:           "Перейти на сайт",
    //     disableLink:        "Если у вас не работает кнопка “Перейти на сайт”, скопируйте данную ссылку и откройте в браузере:",
    //     mailingText:        "Вы получаете новостную рассылку, потому что вы подписались на нашу рассылку через:",
    //     disabledMailing:     "Отказаться от подписки"
    // }

    // data = {
    //     userEmail:          "email",
    //     userPassword:       "password",
    //     domain:             "https://baikal.events"
    // }

    return setData(template, { ...text, ...data });
}

function newPassword(template, text, data) {

    // text = {
    //     header:             "Восстановление пароля",
    //     greeting:           "Здравствуйте",
    //     newPassword:        "Для вашей учетной записи username был запрошен сброс проля. Ваш новый пароль:",
    //     password:           "Пароль",
    //     goToSite:           "Перейти на сайт",
    //     disableLink:        "Если у вас не работает кнопка “Перейти на сайт”, скопируйте данную ссылку и откройте в браузере:",
    //     mailingText:        "Вы получаете новостную рассылку, потому что вы подписались на нашу рассылку через:",
    //     disabledMailing:    "Отказаться от подписки",
    //     ignore:             "Если вы не запрашивали это сообщение, просто проигнорируйте его"
    // }

    // data = {
    //     userName:           "Анастасия Захарова",
    //     userPassword:       "userpassword",
    //     domain:             "https://baikal.events"
    // }

    return setData(template, { ...text, ...data });
}

function successWithdraw(template, text, data) {

    // text = {
    //     header:             "Снятие средств",
    //     greeting:           "Здравствуйте",
    //     message:            "<b>Ваша заявка на вывод средств <span class=\"main-block__message_success\" style=\"color:#8CC261;\" >одобрена</span></b> на сумму" +
    //                         "<span class=\"main-block__price\" style=\"font-weight:600;color:#0A92DB;\" > {amount} руб.</span> Проверьте балланс вашего счета в банке",
    //     goToSite:           "Перейти на сайт",
    //     disableLink:        "Если у вас не работает кнопка “Перейти на сайт”, скопируйте данную ссылку и откройте в браузере:",
    //     mailingText:        "Вы получаете новостную рассылку, потому что вы подписались на нашу рассылку через:",
    //     disabledMailing:    "Отказаться от подписки"
    // }

    // data = {
    //     userName:           "Анастасия Захарова",
    //     amount:             9500,
    //     domain:             "https://baikal.events"
    // }

    return setData(template, { ...text, ...data });
}

function rejectedWithdraw(template, text, data) {

    // text = {
    //     header:             "Снятие средств",
    //     greeting:           "Здравствуйте",
    //     message:            "<b>Ваша заявка на вывод средств</b> на сумму  <span class=\"main-block__price\" style=\"font-weight:600;color:#0A92DB;\" >{amount} руб.</span>" +
    //                         "<span class=\"main-block__message_danger\" style=\"color:#ED2D33;\" >отклонена</span> <b>по причине: </b>{rejectMessage}",
    //     goToSite:           "Перейти на сайт",
    //     disableLink:        "Если у вас не работает кнопка “Перейти на сайт”, скопируйте данную ссылку и откройте в браузере:",
    //     mailingText:        "Вы получаете новостную рассылку, потому что вы подписались на нашу рассылку через:",
    //     disabledMailing:    "Отказаться от подписки"
    // }
    // data = {
    //     userName:           "Анастасия Захарова",
    //     amount:             9500,
    //     rejectMessage:      "Потому что отказано и все",
    //     domain:             "https://baikal.events"
    // }

    return setData(template, { ...text, ...data });
}

function secondEvent(template, text, data){
    // text = {
    //     header:             "Спасибо за ваш заказ",
    //     orderHeader:        "Ваш заказ",
    //     greeting:           "Здравствуйте, {name}",
    //     message:            "Вы зарегистрировались на событие. Подтверждаем, что Ваша регистрация прошла успешно.",
    //     userData:           "Ваши данные",
    //     fullName:           "Имя Фамилия",
    //     phone:              "Телефон",
    //     mailingText:        "Вы получаете новостную рассылку, потому что вы подписались на нашу рассылку через:",
    //     disabledMailing:    "Отказаться от подписки",
    //     ticketsHeader:      "Билеты",
    //     additionalsHeader:  "Дополнительно",
    //     eventInfo:          "Информация о событии",
    //     eName:              "Название",
    //     location:           "Место проведения",
    //     eDate:              "Дата и время",
    //     goToSite:           "Перейти на сайт",
    //     disableLink:        "Если у вас не работает кнопка “Перейти на сайт”, скопируйте данную ссылку и откройте в браузере:",
    //     total:              "Итого",
    //     reminderMessage:    "<b>Если вы еще не оплатили Ваш заказ, сделайте это сейчас!</b> Вот ссылка для оплаты: <br>"
    // }

    // data = {
    //     date:               "Понедельник, 20 июля 2020 г. , 8:00",
    //     userPhone:          "882281488",
    //     userEmail:          "idinahuy@mail.com",
    //     buyable: [
    //         {
    //             type:       "ticket",
    //             price:       1000,
    //             count:       2,
    //             name:       "Детский"
    //         },
    //         {
    //             type:       "additional",
    //             price:       500,
    //             count:       1,
    //             name:       "Крутой"
    //         }
    //     ],
    //     userName:           "Анастасия Захарова",
    //     eventName:          "Веревочные соревнования среди взрослых и детей в Вуки-Парк",
    //     eventLocation:      ["г.Байкальск, горнолыжный курорт “Гора Соболинная”"],
    //     eventDate:          "с 1 октября - по 30 сентября",
    //     domain:             "https://baikal.events",
    //     reminderLink:       "sberbank.ru",
    //     _: function(text){ return text }
    // }

    data.eventLocations = data.eventLocations.join("<br>");

    return setData(setTicketsTable(template, text, data), { ...text, ...data });
}

function reservationNotification(template, text, data){

    // text = {
    //     header:             "Информация о зарегистрированных пользователях",
    //     greeting:           "Здравствуйте",
    //     message:            "На Ваше событие <b>{eventName}</b> зарегистрировались.",
    //     goToSite:           "Перейти на сайт",
    //     name:               "Наименование",
    //     booked:             "Забронировано",
    //     paid:               "Оплачено",
    //     price:              "Цена",
    //     amount:             "Сумма",
    //     tickets:            "Билеты",
    //     additionals:        "Доп. услуги",
    //     disableLink:        "Если у вас не работает кнопка “Перейти на сайт”, скопируйте данную ссылку и откройте в браузере:",
    //     mailingText:        "Вы получаете новостную рассылку, потому что вы подписались на нашу рассылку через:",
    //     disabledMailing:     "Отказаться от подписки",
    //     registered:         "Зарегистрировано",
    // }

    // data = {
    //     eventName:          "Веревочные соревнования среди взрослых и детей в Вуки-Парк",
    //     eventDate:          "с 1 октября - по 30 сентября",
    //     registeredCount:    "10",
    //     domain:             "http://baikal.events",
    //     buyable: [
    //         {
    //             type: "additional",
    //             name: "Взрослый",
    //             price: 1000,
    //             count: [
    //                 {
    //                     paid: true,
    //                     count: 5
    //                 },
    //                 {
    //                     paid: false,
    //                     count: 10
    //                 }
    //             ]
    //         },
    //         {
    //             type: "ticket",
    //             name: "Взрослый",
    //             price: 100,
    //             count: [
    //                 {
    //                     paid: true,
    //                     count: 0
    //                 },
    //                 {
    //                     paid: false,
    //                     count: 10
    //                 }
    //             ]
    //         }
    //     ],
    //     _: function(text){ return text }
    // }

    let totalBlockC = "";
    let allTicketsTableC = "";

    if(data.buyable && data.buyable.length){
        const tickets = [];
        const additionals = [];
        const total = data.buyable.reduce((sec, cur) => {

            const {type, price, count } = cur;
            const paidCount = count[0].paid ? count[0].count : count[1].count;

            if(type === "ticket")
                tickets.push(cur)
            else
                additionals.push(cur)

            return sec + price * paidCount;
        }, 0);

        let ticketsBlock = "";
        totalBlockC = totalBlock;
        allTicketsTableC = allTicketsTable;

        if(tickets.length){
            ticketsBlock += ticketsCategory.replace("{category}", text.tickets);
            ticketsBlock += setTicketsData(tickets, data);
        }

        if(additionals.length){
            ticketsBlock += ticketsCategory.replace("{category}", text.additionals);
            ticketsBlock += setTicketsData(additionals, data);
        }

        allTicketsTableC = allTicketsTableC.replace("{ticketsBlock}", ticketsBlock);
        totalBlockC = totalBlockC.replace("{totalAmount}", `${total} ${data._("rub")}`);
    }

    template = template.replace("{allTicketsTable}", allTicketsTableC);
    template = template.replace("{totalBlock}", totalBlockC);
    
    return setData(template, {...text, ...data});
}

function digest(template, text, data){

    // text = {
    //     header:             "Дайджест событий",
    //     headerLink:         "Все события",
    //     mailingText:        "Вы получаете новостную рассылку, потому что вы подписались на нашу рассылку через:",
    //     disabledMailing:    "Отказаться от подписки",
    //     details:            "Подробнее"
    // }
    // data = {
    //     domain:             "https://baikal.events",
    //     subjects: [
    //         {
    //             name: "Гастрономия",
    //             actions: [
    //                 {
    //                     imageUrl: "/img/123.png",
    //                     name: "Международный фестиваль Книгамарт1",
    //                     dates: [
    //                         {
    //                             date_start: new Date().toISOString(),
    //                             date_end:   null,
    //                             time_start: null,
    //                             time_end:   null,
    //                             days:       [0,3,6]
    //                         }
    //                     ],
    //                     locations: [
    //                         "Иркутск1",
    //                         "Ангарск",
    //                         "Шелехово"
    //                     ],
    //                     description: "Ну крутое событие кароче",
    //                     slug: "slug"
    //                 }
    //             ]
    //         }
    //     ],
    //     _: text => { return text }
    // };

    let allSubjects = "";

    for(const {name: subjectName, actions} of data.subjects){

        let subjectTableC = subjectTable;
        let allCards = "";

        for(let i = 0; i < actions.length; i+=2){

            let cardsLine = 
            `
            <tr>
                {eventCards}
            </tr>
            `;

            let cards = "";

            cards +=                    setCardData(actions[i], eventCard, data.domain, data._);
            if(actions[i + 1]) cards += setCardData(actions[i + 1], eventCard.replace("padding-right:10px;", "padding-left:10px;"), data.domain, data._);

            cardsLine = cardsLine.replace(`{eventCards}`, cards);
            allCards += cardsLine;
        }

        subjectTableC = subjectTableC.replace("{subjectName}", subjectName);
        subjectTableC = subjectTableC.replace("{eventCards}", allCards);

        allSubjects += subjectTableC;
    }

    template = template.replace("{subjects}", allSubjects);

    return setData(template, { ...text, ...data });
}

function setCardData(action, card, domain, _){
    action.dates =      action.dates.map(el => dateToString(el, _)).join("<br/>");
    action.locations =  action.locations.join("<br/>");

    card = card.replace("{imageUrl}", action.imageUrl.startsWith(`http`) ? action.imageUrl : `${domain}${action.imageUrl}`);
    card = card.replace("{dates}", action.dates);
    card = card.replace("{name}", action.name);
    card = card.replace("{locations}", action.locations);
    card = card.replace("{description}", action.description);
    card = card.replace("{eventUrl}", `${domain}/event/${action.slug}`);

    return card;
}

function setTicketsData(tickets, data){
    let ticketLine = ""

    for(const {name, price, count} of tickets){

        let ticketDataC = ticketData;

        const paidCount =   count[0].paid ? count[0].count : count[1].count;
        const bookedCount = count[0].paid ? count[1].count : count[0].count;
        const ticketAmount = paidCount * price;

        ticketDataC = ticketDataC.replace("{ticketName}", name);
        ticketDataC = ticketDataC.replace("{ticketBookedCount}", bookedCount ? `${bookedCount} ${data._("piece_short")}` : "-");
        ticketDataC = ticketDataC.replace("{ticketPaidCount}", paidCount ? `${paidCount} ${data._("piece_short")}` : "-");
        ticketDataC = ticketDataC.replace("{ticketPrice}", `${price} ₽`);
        ticketDataC = ticketDataC.replace("{ticketAmount}", ticketAmount ? `${ticketAmount} ₽` : "-");

        ticketLine += ticketDataC;
    }

    return ticketLine;
}

function setData(template, data) {

    data.domainWithoutHttp = data.domain.replace(/http.*:\/\//, "");

    template = template.replace("{mailing}", mailing);

    for (const [key, value] of Object.entries(data)) {
        const replace = new RegExp(`{${key}}`, "g");
        template = template.replace(replace, value);
    }

    return template;
}

function setTickets(tickets, ticket, data) {
    let ticketsС = "";

    for (let _ticket of tickets) {
        let ticketC = ticket;
        ticketC = ticketC.replace("{ticketName}", `${_ticket.name} - ${_ticket.count}${data._("piece_short")}`);
        ticketC = ticketC.replace("{ticketPrice}", `${_ticket.price * _ticket.count}${data._("piece_short")}`);
        ticketsС += ticketC;
    }

    return ticketsС;
}

function setTicketsTable(template, text, data){
    let ticketsblockС = ticketsBlock;

    let tickets = [];
    let additionals = [];

    const total = data.buyable.reduce((sec, cur) => {

        const { count, price, type } = cur;

        if (type === "ticket") tickets.push(cur)
        else additionals.push(cur)

        return sec + count * price;
    }, 0);

    let ticketsTableС = "";
    let additionalsTableC = "";

    if (tickets.length) {
        ticketsTableС = ticketsTable;
        ticketsTableС = ticketsTableС.replace("{ticketsHeader}", text.ticketsHeader);
        ticketsTableС = ticketsTableС.replace("{tickets}", setTickets(tickets, ticket, data));
    }

    if (additionals.length) {
        additionalsTableC = ticketsTable;
        additionalsTableC = additionalsTableC.replace("{ticketsHeader}", text.additionalsHeader);
        additionalsTableC = additionalsTableC.replace("{tickets}", setTickets(additionals, ticket, data));
    }

    ticketsblockС = ticketsblockС.replace("{ticketsTable}", ticketsTableС);
    ticketsblockС = ticketsblockС.replace("{additionalsTable}", additionalsTableC);
    ticketsblockС = ticketsblockС.replace("{price}", `${total}${data._("rub")}`);

    template = template.replace("{ticketsBlock}", ticketsblockС);

    return template;
}