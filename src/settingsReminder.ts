export const reminderDays=['SU','MO','TU','WE','TH','FR','SA'] as const;
export function reminderCalendar(day:string,time:string,now=new Date()){
 if(!reminderDays.includes(day as any)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw Error('Choose a valid day and time.');
 const dubai=new Date(now.getTime()+4*3600000);
 const target=new Date(Date.UTC(dubai.getUTCFullYear(),dubai.getUTCMonth(),dubai.getUTCDate(),Number(time.slice(0,2))-4,Number(time.slice(3))));
 target.setUTCDate(target.getUTCDate()+(reminderDays.indexOf(day as any)-dubai.getUTCDay()+7)%7);if(target<=now)target.setUTCDate(target.getUTCDate()+7);
 const stamp=(d:Date)=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
 return ['BEGIN:VCALENDAR','VERSION:2.0','CALSCALE:GREGORIAN','PRODID:-//Mealday//Weekly planner//EN','BEGIN:VEVENT','UID:mealday-weekly-planning@mealday.app','DTSTAMP:'+stamp(now),'DTSTART:'+stamp(target),'DURATION:PT15M','RRULE:FREQ=WEEKLY','SUMMARY:Plan your week with Mealday','DESCRIPTION:Choose your meals and check your grocery list.','URL:https://mealday-kitchen-app.jauntycomet1.chatgpt.site','BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:Time to plan your meals','END:VALARM','END:VEVENT','END:VCALENDAR',''].join('\r\n');
}
export function readReminder(){try{const r=JSON.parse(localStorage.getItem('mealday.settings.reminder')||'null');if(r&&reminderDays.includes(r.day)&&/^([01]\d|2[0-3]):[0-5]\d$/.test(r.time))return r}catch{}return {day:'SU',time:'10:00',exported:false}}
