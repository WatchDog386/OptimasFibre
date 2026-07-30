const fs = require('fs');
let s = fs.readFileSync('src/components/Hero.jsx', 'utf8');
const opener = s.indexOf('{/* Mobile pair slider */}');
const closer = s.indexOf('{/* Dot indicators */}');
const mobileGrid =
  '<div className="grid grid-cols-2 md:hidden gap-3">\n' +
  '          {hotspotPlans.map((plan, index) => (\n' +
  '            <motion.div\n' +
  '              key={index}\n' +
  '              whileHover={{ y: -5 }}\n' +
  '              onClick={handleHotspotSelect}\n' +
  "              className={`rounded-2xl p-4 cursor-pointer relative overflow-hidden bg-gradient-to-br ${plan.color} shadow-md`}\n" +
  '            >\n' +
  '              <Wifi className="absolute top-0 right-0 w-8 h-8 text-white opacity-20 m-2" />\n' +
  '              <div className="relative z-10 text-white h-20 flex flex-col justify-between">\n' +
  '                <div>\n' +
  '                  <h3 className="font-bold text-[10px] lowercase tracking-[0.08em] mb-1.5">{plan.name}</h3>\n' +
  '                  <span className="inline-block bg-white/30 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded-md lowercase">\n' +
  '                    {plan.duration}\n' +
  '                  </span>\n' +
  '                </div>\n' +
  '                <div>\n' +
  '                  <p className="text-[10px] opacity-80 lowercase font-bold mb-0.5">only</p>\n' +
  '                  <p className="text-lg font-bold leading-none">Ksh {plan.price}</p>\n' +
  '                </div>\n' +
  '              </div>\n' +
  '            </motion.div>\n' +
  '          ))}\n' +
  '        </div>';
if (opener === -1 || closer === -1) {
  console.error('markers not found');
  process.exit(1);
}
const start = closer + '{/* Dot indicators */}'.length + 1;
s = s.slice(0, opener) + mobileGrid + s.slice(start);
fs.writeFileSync('src/components/Hero.jsx', s);
console.log('patched hotspot to plain grid list');
