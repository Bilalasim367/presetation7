import re
p = r"C:\Users\Bilal\OneDrive\Desktop\presentaion\data\slides.ts"
s = open(p).read()

m3 = s.index("    id: 3,\n")
m4 = s.index("    id: 4,\n")
m5 = s.index("    id: 5,\n")

start3 = s.rindex("{", 0, m3)
start4 = s.rindex("{", 0, m4)
start5 = s.rindex("{", 0, m5)

sec3 = s[start3:start4]
sec4 = s[start4:start5]

def rename_ids(block, old, new):
    block = block.replace(f"    id: {old},", f"    id: {new},")
    block = re.sub(rf'"\b{old}-', f'"{new}-', block)
    return block

new3 = rename_ids(sec4, 4, 3)
new4 = rename_ids(sec3, 3, 4)

new3 = new3.replace("Student 4's section", "this section")
new3 = new3.replace("Student 4 wrote", "Iman fatima wrote")
new3 = new3.replace("Close Student 4's section", "Close this section")

new_s = s[:start3] + new3 + new4 + s[start5:]

new_s = new_s.replace(
    '  { id: 3, title: "Projective Assessment", shortTitle: "Projective", icon: "Eye" },',
    '  { id: 3, title: "Objective Assessment", shortTitle: "Objective", icon: "ClipboardCheck" },'
)
new_s = new_s.replace(
    '  { id: 4, title: "Objective Assessment", shortTitle: "Objective", icon: "ClipboardCheck" },',
    '  { id: 4, title: "Projective Assessment", shortTitle: "Projective", icon: "Eye" },'
)

open(p, "w").write(new_s)
print("done")
PY