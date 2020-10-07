const ticket =          "<tr class=\"tickets__ticket\">" +
                            "<td class=\"tickets__left\" style=\"text-align:left;padding-top:10px;\">" +
                                "<span class=\"tickets__name\"" +
                                    "style=\"color:#4F4F4F;font-size:18px;\">" +
                                    "{ticketName}" +
                                "</span>" +
                            "</td>" +
                            "<td class=\"tickets__right\" style=\"text-align:right;padding-top:10px;\">" +
                                "<span class=\"tickets__price\"" +
                                    "style=\"color:#0A92DB;letter-spacing:0.03em;\">" +
                                    "<b>{ticketPrice}</b>" +
                                "</span>" +
                            "</td>" +
                        "</tr>";

const ticketsTable =    "<table class=\"tickets\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\"" +
                            "style=\"margin-top:25px;width:100%;\">" +
                            "<tr class=\"tickets__header\">" +
                                "<th class=\"tickets__left\" style=\"text-align:left;padding-bottom:15px;\">" +
                                    "<span class=\"tickets__name\"" +
                                        "style=\"color:#4F4F4F;font-size:18px;\">" +
                                        "<b>{ticketsHeader}</b>" +
                                    "</span>" +
                                "</th>" +
                            "</tr>" +
                            "{tickets}" +
                        "</table>";

const ticketsBlock =    "<tr>" +
                            "<td>" +
                                "{ticketsTable}" +
                                "{additionalsTable}" +
                                "<table class=\"total\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\"" +
                                    "style=\"margin-top:20px;width:100%;padding-top:10px;border-top-width:1px;border-top-style:solid;border-top-color:#F0F0F0;\">" +
                                    "<tr class=\"total__left\">" +
                                        "<td class=\"total__left\">" +
                                            "<span class=\"total__text\"" +
                                                "style=\"text-transform:uppercase;color:#4F4F4F;font-size:18px;\">" +
                                                "<b>{total}</b>" +
                                            "</span>" +
                                        "</td>" +
                                        "<td class=\"total__right\" style=\"text-align:right;\">" +
                                            "<span" +
                                                "class=\"total__price\"" +
                                                "style=\"color:#0A92DB;letter-spacing:0.03em;font-size:18px;\">" +
                                                "<b>{price}</b>" +
                                            "</span>" +
                                        "</td>" +
                                    "</tr>" +
                                "</table>" +
                            "</td>" +
                        "</tr>"

const mailing =         "<tr class=\"mailing\">" +
                            "<td>" +
                                "<span class=\"mailing__text\" style=\"display:block;margin-top:30px;color:#4F4F4F;font-size:14px;\" >" +
                                    "{mailingText} " +
                                    "<a href=\"{domain}\" class=\"mailing__link\" target=\"_blank\" style=\"color:#0A92DB;text-decoration:none;\" >{domainWithoutHttp}</a>" +
                                "</span>" +
                                "<a href=\"http://baikal.events\" class=\"mailing__disabling\" target=\"_blank\" style=\"display:block;margin-top:30px;font-size:18px;color:#4F4F4F;text-decoration:none;\" >{disabledMailing}</a>" +
                            "</td>" +
                        "</tr>"

const ticketsCategory = "<tr class=\"tickets-table__category\" colspan=\"5\">" +
                            "<td style=\"color:#4F4F4F;padding-top:30px;font-size:12px;font-weight:600;\" >{category}</td>" +
                        "</tr>"

const ticketData =      "<tr class=\"tickets-table__ticket\">" +
                            "<td style=\"font-size:14px;color:#4F4F4F;padding-top:10px;\" >{ticketName}</td>" +
                            "<td class=\"tickets-table__ticket_center\" style=\"text-align:center;font-size:14px;color:#4F4F4F;padding-top:10px;\" >{ticketBookedCount}</td>" +
                            "<td class=\"tickets-table__ticket_center\" style=\"text-align:center;font-size:14px;color:#4F4F4F;padding-top:10px;\" >{ticketPaidCount}</td>" +
                            "<td class=\"tickets-table__ticket_center\" style=\"text-align:center;font-size:14px;color:#4F4F4F;padding-top:10px;\" >{ticketPrice}</td>" +
                            "<td class=\"tickets-table__ticket_center\" style=\"text-align:center;font-size:14px;color:#4F4F4F;padding-top:10px;\" >{ticketAmount}</td>" +
                        "</tr>";

const totalBlock =      `<span class="main-block__total" style="font-size:16px;font-weight:600;margin-top:20px;display:block;color:#4F4F4F;" >
                            {paid}: <span class="main-block__amount" style="color:#0A92DB;" >{totalAmount}</span>
                        </span>`;

const allTicketsTable = `<table class="tickets-table" border="0" cellpadding="0" cellspacing="0" style="width:100%;margin-top:60px;" >
                            <tr class="tickets-table__header">
                                <th style="font-size:14px;color:#4F4F4F;text-align:left;" >{name}</th>
                                <th class="tickets-table__header_center" style="font-size:14px;color:#4F4F4F;text-align:center !important;" >{booked}</th>
                                <th class="tickets-table__header_center" style="font-size:14px;color:#4F4F4F;text-align:center !important;" >{paid}</th>
                                <th class="tickets-table__header_center" style="font-size:14px;color:#4F4F4F;text-align:center !important;" >{price}</th>
                                <th class="tickets-table__header_center" style="font-size:14px;color:#4F4F4F;text-align:center !important;" >{amount}</th>
                            </tr>
                            {ticketsBlock}
                        </table>`

const eventCard =       `<td>
                            <table class="cards" border="0" cellpadding="0" cellspacing="0" style="width:100%;padding-bottom:40px;" >
                                <tr>
                                    <td class="card card_first" style="width:50%;padding-top:20px;vertical-align:top;padding-right:10px;" >
                                        <img src="{imageUrl}" alt="img" class="card__img" style="width:100%;" >
                                        <span class="card__date" style="margin-top:5px;letter-spacing:0.1em;font-size:14px;display:block;color:#C4C4C4 !important;" >
                                            {dates}
                                        </span>
                                        <span class="card__name" style="font-size:18px;line-height:21px;font-weight:600;margin-top:10px;display:block;color:#4F4F4F;" >
                                            {name}
                                        </span>
                                        <span class="card__location" style="margin-top:10px;font-size:14px;display:block;color:#4F4F4F;" >
                                            {locations}
                                        </span>
                                        <span class="card__description" style="margin-top:10px;font-size:12px;display:block;color:#4F4F4F;" >
                                            {description}
                                        </span>
                                        <a href="{eventUrl}" class="card__link" style="padding-top:15px;padding-bottom:15px;padding-right:35px;padding-left:35px;background-color:#0A92DB;background-image:none;background-repeat:repeat;background-position:top left;background-attachment:scroll;border-radius:100px;color:#ffffff;font-size:16px;text-decoration:none;display:block;margin-top:20px;text-align:center;" >{details}</a>
                                    </td>
                                </tr>
                            </table>
                        </td>`;

const subjectTable =    `<table class="section" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                                <td class="section__name" style="font-size:18px;font-weight:600;color:#4F4F4F;margin-top:5px;margin-bottom:5px;margin-right:0;margin-left:0;" >
                                    {subjectName}
                                </td>
                            </tr>
                            {eventCards}
                        </table>`;

export {
    ticket,
    ticketsTable,
    ticketsBlock,
    mailing,
    ticketsCategory,
    ticketData,
    totalBlock,
    allTicketsTable,
    eventCard,
    subjectTable
}