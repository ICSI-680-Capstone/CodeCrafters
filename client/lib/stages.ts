import { Stage } from "@/types";

// Each building has three levels of tasks:
//   Level 1 — Foundation: variables, data types, print(), input()
//   Level 2 — Walls:      conditionals, loops, lists
//   Level 3 — Roof:       functions with parameters and return values
export const STAGES: Stage[] = [
  // ─── Stage 1 · Library ─────────────────────────────────────────────────
  {
    stageNumber: 1,
    building: "Library",
    levels: {
      1: {
        Architect: {
          title: "Library · Foundation — Name It",
          description: "The library needs a name before construction can begin.",
          steps: [
            "Create a variable called `lib_name`.",
            'Assign it the string value: "Grand Library"',
            "Print the variable.",
          ],
          starterCode: "# Define your variable below\n\n",
          expected_output: "Grand Library",
        },
        Builder: {
          title: "Library · Foundation — Count the Books",
          description: "Every library needs books on the shelves.",
          steps: [
            "Create a variable called `book_count`.",
            "Assign it the integer value: 500",
            "Print the variable.",
          ],
          starterCode: "# Define your variable below\n\n",
          expected_output: "500",
        },
      },
      2: {
        Architect: {
          title: "Library · Walls — Stock Check",
          description: "Decide whether the library is well stocked.",
          steps: [
            "Create `books = 150`.",
            'If `books > 100` print "Well stocked!", else print "Need more books".',
          ],
          starterCode: "# Conditional stock check\nbooks = 150\n\n",
          expected_output: "Well stocked!",
        },
        Builder: {
          title: "Library · Walls — List the Genres",
          description: "Print every genre carried in the library.",
          steps: [
            'Create `genres = ["Fiction", "Science", "History"]`.',
            "Loop through the list and print each genre on its own line.",
          ],
          starterCode: "# Create list and loop\n\n",
          expected_output: "Fiction\nScience\nHistory",
        },
      },
      3: {
        Architect: {
          title: "Library · Roof — Welcome Function",
          description: "Greet every reader who walks in.",
          steps: [
            "Define a function `greet_reader()`.",
            'Inside, print: "Welcome to the Library!"',
            "Call the function.",
          ],
          starterCode: "# Define and call a function\n\n",
          expected_output: "Welcome to the Library!",
        },
        Builder: {
          title: "Library · Roof — Book Info Function",
          description: "Print a book's title using a function.",
          steps: [
            'Define `book_info(title)` that prints: "Book: " + title',
            'Call it with the argument "Python 101".',
          ],
          starterCode: "# Define and call book_info(title)\n\n",
          expected_output: "Book: Python 101",
        },
      },
    },
  },

  // ─── Stage 2 · Classroom ───────────────────────────────────────────────
  {
    stageNumber: 2,
    building: "Classroom",
    levels: {
      1: {
        Architect: {
          title: "Classroom · Foundation — Ask for Input",
          description: "The classroom needs to know who's teaching today.",
          steps: [
            'Use `input()` to ask: "Enter teacher name: "',
            "Store the result in `teacher`.",
            'Print: "Welcome, " + teacher',
          ],
          starterCode: "# Get input and greet the teacher\n\n",
          expected_output: null,
        },
        Builder: {
          title: "Classroom · Foundation — Count Students",
          description: "How many students are joining today?",
          steps: [
            'Use `input()` to ask: "How many students? "',
            "Convert to int, store in `students`.",
            'Print: "Seats needed: " + str(students)',
          ],
          starterCode: "# Read student count\n\n",
          expected_output: null,
        },
      },
      2: {
        Architect: {
          title: "Classroom · Walls — Roll Call",
          description: "Greet every student in the class.",
          steps: [
            'Create `students = ["Alex", "Sam", "Jo"]`.',
            'Loop through the list and print: "Hi " + name',
          ],
          starterCode: "# Loop over the students\n\n",
          expected_output: "Hi Alex\nHi Sam\nHi Jo",
        },
        Builder: {
          title: "Classroom · Walls — Pass or Retry",
          description: "Check whether a test score is a pass.",
          steps: [
            "Create `score = 85`.",
            'If `score >= 80` print "Great!", else print "Try again".',
          ],
          starterCode: "# Conditional score check\nscore = 85\n\n",
          expected_output: "Great!",
        },
      },
      3: {
        Architect: {
          title: "Classroom · Roof — Start Class",
          description: "Announce the class with a function.",
          steps: [
            'Define `start_class(teacher)` that prints: "Class by " + teacher',
            'Call it with the argument "Ms. Ada".',
          ],
          starterCode: "# Define and call start_class(teacher)\n\n",
          expected_output: "Class by Ms. Ada",
        },
        Builder: {
          title: "Classroom · Roof — Grade Function",
          description: "Return a grade from a score.",
          steps: [
            'Define `grade(score)` that returns "Pass" if score >= 60, else "Fail".',
            "Print `grade(75)`.",
          ],
          starterCode: "# Define grade(score) and print the result\n\n",
          expected_output: "Pass",
        },
      },
    },
  },

  // ─── Stage 3 · Cafeteria ───────────────────────────────────────────────
  {
    stageNumber: 3,
    building: "Cafeteria",
    levels: {
      1: {
        Architect: {
          title: "Cafeteria · Foundation — Meal Price",
          description: "Display today's meal price.",
          steps: [
            "Create `meal_price = 8`.",
            'Print: "Price: $" + str(meal_price)',
          ],
          starterCode: "# Print the meal price\n\n",
          expected_output: "Price: $8",
        },
        Builder: {
          title: "Cafeteria · Foundation — Meal Name",
          description: "Announce today's special.",
          steps: [
            'Create `meal_name = "Pasta"`.',
            'Print: "Today: " + meal_name',
          ],
          starterCode: "# Print today's meal\n\n",
          expected_output: "Today: Pasta",
        },
      },
      2: {
        Architect: {
          title: "Cafeteria · Walls — Menu Check",
          description: "Only serve food if the cafeteria is open.",
          steps: [
            "Create a variable `is_open = True`.",
            'Write an if/else: if open, print "Cafeteria is serving!", else print "Closed."',
          ],
          starterCode: "# Conditional check\nis_open = True\n\n",
          expected_output: "Cafeteria is serving!",
        },
        Builder: {
          title: "Cafeteria · Walls — Enough Food?",
          description: "Check if there are enough food trays.",
          steps: [
            "Set `trays = 30`, `students = 25`.",
            'If trays >= students, print "Enough trays!", else print "Need more trays!"',
          ],
          starterCode: "# Check tray supply\ntrays = 30\nstudents = 25\n\n",
          expected_output: "Enough trays!",
        },
      },
      3: {
        Architect: {
          title: "Cafeteria · Roof — Price Total",
          description: "Add two item prices with a function.",
          steps: [
            "Define `price_total(a, b)` that returns a + b.",
            "Print `price_total(5, 3)`.",
          ],
          starterCode: "# Define price_total(a, b) and print the result\n\n",
          expected_output: "8",
        },
        Builder: {
          title: "Cafeteria · Roof — Is It Open?",
          description: "Return True when we're in serving hours.",
          steps: [
            "Define `is_open(hour)` that returns `hour >= 9 and hour <= 14`.",
            "Print `is_open(12)`.",
          ],
          starterCode: "# Define is_open(hour) and print the result\n\n",
          expected_output: "True",
        },
      },
    },
  },

  // ─── Stage 4 · Science Lab ─────────────────────────────────────────────
  {
    stageNumber: 4,
    building: "Science Lab",
    levels: {
      1: {
        Architect: {
          title: "Science Lab · Foundation — Label a Chemical",
          description: "Every beaker needs a label.",
          steps: [
            'Create `chemical = "H2O"`.',
            "Print the variable.",
          ],
          starterCode: "# Name a chemical\n\n",
          expected_output: "H2O",
        },
        Builder: {
          title: "Science Lab · Foundation — Count Beakers",
          description: "Track how many beakers are on the bench.",
          steps: [
            "Create `beakers = 12`.",
            'Print: "Beakers: " + str(beakers)',
          ],
          starterCode: "# Count the beakers\n\n",
          expected_output: "Beakers: 12",
        },
      },
      2: {
        Architect: {
          title: "Science Lab · Walls — Experiment List",
          description: "Run through today's experiments.",
          steps: [
            'Create `experiments = ["Boil", "Freeze", "Mix"]`.',
            "Loop through the list and print each experiment on its own line.",
          ],
          starterCode: "# Loop the experiments\n\n",
          expected_output: "Boil\nFreeze\nMix",
        },
        Builder: {
          title: "Science Lab · Walls — Temperature Check",
          description: "Decide if the lab is warm or cold.",
          steps: [
            "Create `temp = 75`.",
            'If `temp > 50` print "Warm", else print "Cold".',
          ],
          starterCode: "# Temperature check\ntemp = 75\n\n",
          expected_output: "Warm",
        },
      },
      3: {
        Architect: {
          title: "Science Lab · Roof — Ring the Bell",
          description: "Ring a bell function at the start of class.",
          steps: [
            "Define a function `ring_bell()`.",
            'Inside, print: "🔔 Class has started!"',
            "Call the function.",
          ],
          starterCode: "# Define and call a function\n\n",
          expected_output: "🔔 Class has started!",
        },
        Builder: {
          title: "Science Lab · Roof — Greet Students",
          description: "Write a function that greets a student by name.",
          steps: [
            'Define `greet(name)` that prints: "Hello, " + name + "!"',
            'Call it with the argument "Alex".',
          ],
          starterCode: "# Define and call greet(name)\n\n",
          expected_output: "Hello, Alex!",
        },
      },
    },
  },

  // ─── Stage 5 · Playground ──────────────────────────────────────────────
  {
    stageNumber: 5,
    building: "Playground",
    levels: {
      1: {
        Architect: {
          title: "Playground · Foundation — Count the Slides",
          description: "How many slides are on the playground?",
          steps: [
            "Create `slide_count = 3`.",
            'Print: "Slides: " + str(slide_count)',
          ],
          starterCode: "# Count the slides\n\n",
          expected_output: "Slides: 3",
        },
        Builder: {
          title: "Playground · Foundation — Count the Swings",
          description: "Keep track of the swing set.",
          steps: [
            "Create `swing_count = 4`.",
            'Print: "Swings: " + str(swing_count)',
          ],
          starterCode: "# Count the swings\n\n",
          expected_output: "Swings: 4",
        },
      },
      2: {
        Architect: {
          title: "Playground · Walls — Equipment List",
          description: "List every piece of playground equipment.",
          steps: [
            'Create `equipment = ["Swings", "Slide", "Seesaw"]`.',
            "Loop through it and print each item.",
          ],
          starterCode: "# Create list and loop\n\n",
          expected_output: "Swings\nSlide\nSeesaw",
        },
        Builder: {
          title: "Playground · Walls — Count Activities",
          description: "How many activities can kids do?",
          steps: [
            'Create `activities = ["Football", "Basketball", "Tag"]`.',
            'Print: "Total activities: " + str(len(activities))',
          ],
          starterCode: "# List and length\n\n",
          expected_output: "Total activities: 3",
        },
      },
      3: {
        Architect: {
          title: "Playground · Roof — Equipment Counter",
          description: "Count items with a function.",
          steps: [
            "Define `count_equipment(items)` that returns `len(items)`.",
            'Print `count_equipment(["Swings", "Slide", "Seesaw"])`.',
          ],
          starterCode: "# Define count_equipment(items) and print the result\n\n",
          expected_output: "3",
        },
        Builder: {
          title: "Playground · Roof — Double the Fun",
          description: "Return a doubled value from a function.",
          steps: [
            "Define `double_fun(n)` that returns `n * 2`.",
            "Print `double_fun(5)`.",
          ],
          starterCode: "# Define double_fun(n) and print the result\n\n",
          expected_output: "10",
        },
      },
    },
  },
];
