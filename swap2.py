import re

p = r"C:\Users\Bilal\OneDrive\Desktop\presentaion\data\slides.ts"
s = open(p).read()

# Locate SECTIONS array
marker = "export const SECTIONS: readonly Section[] = ["
start = s.index(marker) + len(marker)
# find matching closing bracket for the array
depth = 1
i = start
while i < len(s) and depth > 0:
    c = s[i]
    if c == '[':
        depth += 1
    elif c == ']':
        depth -= 1
    i += 1
array_end = i  # position after closing ]
prefix = s[:start]
array_body = s[start:array_end-1]  # without trailing ]
suffix = s[array_end-1:]

# Now split array_body into top-level section objects { ... }
# Find each section object: starts at '{' at depth 1 within array
sections = []
depth = 0
cur_start = None
# We only care about depth 1 objects
i = 0
n = len(array_body)
while i < n:
    if array_body[i] == '{':
        if depth == 0:
            cur_start = i
        depth += 1
    elif array_body[i] == '}':
        depth -= 1
        if depth == 0 and cur_start is not None:
            sections.append((cur_start, i+1))
            cur_start = None
    i += 1

print("num sections:", len(sections))
for st, en in sections:
    # get id
    m = re.search(r'id:\s*(\d+),', array_body[st:en])
    print("section id:", m.group(1) if m else "?", "len", en-st)

# sections list in order; swap index 2 and 3 (0-based) -> sections 3 and 4
assert len(sections) == 5
# Build new array body
# Replace sections[2] and sections[3] content
# Get raw strings
s2 = array_body[sections[2][0]:sections[2][1]]
s3 = array_body[sections[3][0]:sections[3][1]]

# rename ids: s2 (projective -> objective): id 3->... wait
# After swap, position 2 (section 3) should be Objective (old section 4). position 3 (section 4) should be Projective (old section 3).
# So new position 2 = old section 4 content with id 3
# new position 3 = old section 3 content with id 4
def rename_section_id(block, new_id):
    block = re.sub(r'    id: \d+,', f'    id: {new_id},', block, count=1)
    return block

def rename_slide_ids(block, old, new):
    return re.sub(rf'"\b{old}-', f'"{new}-', block)

# old section 3 (projective) -> becomes section 4: rename 3->4
proj_as_sec4 = rename_slide_ids(s2, 3, 4)
proj_as_sec4 = rename_section_id(proj_as_sec4, 4)
# old section 4 (objective) -> becomes section 3: rename 4->3
obj_as_sec3 = rename_slide_ids(s3, 4, 3)
obj_as_sec3 = rename_section_id(obj_as_sec3, 3)

# Fix cross-references in notes
obj_as_sec3 = obj_as_sec3.replace("Student 4's section", "this section")
obj_as_sec3 = obj_as_sec3.replace("Student 4 wrote", "Iman fatima wrote")
obj_as_sec3 = obj_as_sec3.replace("Close Student 4's section", "Close this section")

# Fix metadata for swapped sections
# section 3 now Objective
obj_as_sec3 = obj_as_sec3.replace('title: "Projective Assessment"', 'title: "Objective Assessment"')
obj_as_sec3 = obj_as_sec3.replace('shortTitle: "Projective"', 'shortTitle: "Objective"')
obj_as_sec3 = obj_as_sec3.replace('icon: "Eye"', 'icon: "ClipboardCheck"')
# section 4 now Projective
proj_as_sec4 = proj_as_sec4.replace('title: "Objective Assessment"', 'title: "Projective Assessment"')
proj_as_sec4 = proj_as_sec4.replace('shortTitle: "Objective"', 'shortTitle: "Projective"')
proj_as_sec4 = proj_as_sec4.replace('icon: "ClipboardCheck"', 'icon: "Eye"')

# Also fix cover visuals: objective section cover should be "objective", projective "projective"
# The old objective cover had visual: "objective" (stays with objective content -> now section 3). Good.
# The old projective cover had visual: "projective" (stays with projective content -> now section 4). Good.

# Rebuild array body
parts = []
last = 0
for idx, (st, en) in enumerate(sections):
    if idx == 2:
        parts.append(obj_as_sec3)
    elif idx == 3:
        parts.append(proj_as_sec4)
    else:
        parts.append(array_body[st:en])
    # add separator between sections
    if idx < len(sections)-1:
        # find separator between this section and next
        nxt = sections[idx+1][0]
        sep = array_body[en:nxt]
        parts.append(sep)

new_body = "".join(parts)
new_s = prefix + new_body + suffix

# Update SECTION_PLAN
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