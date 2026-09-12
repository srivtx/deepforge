import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ds-266",
    title: "Memory Pool Freelist Pop/Push",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simulate a memory pool with a LIFO free list.\n\nnum_blocks blocks are initially free as a stack of ids 0 through num_blocks-1. operations contains \"alloc\" (pop a free block and record its id, or -1 when exhausted), \"free\" (values[i] is the block id; only currently allocated blocks can be returned), or \"in_use\" (record the number of allocated blocks).\n\nReturn the list of recorded results.",
    starterCode: `def freelist_ops(num_blocks, operations, values):
    # Your code here
    pass`,
    solution: `def freelist_ops(num_blocks, operations, values):
    free = list(range(num_blocks))
    in_use = set()
    out = []
    for op, val in zip(operations, values):
        if op == "alloc":
            if free:
                block = free.pop()
                in_use.add(block)
                out.append(block)
            else:
                out.append(-1)
        elif op == "free":
            if 0 <= val < num_blocks and val in in_use:
                in_use.remove(val)
                free.append(val)
            out.append(None)
        else:
            out.append(len(in_use))
    return out`,
    testCases: [
      { input: [3, ["alloc", "alloc", "free", "alloc", "in_use"], [0, 0, 1, 0, 0]], expected: [2, 1, null, 1, 2] },
      { input: [2, ["alloc", "alloc", "alloc"], [0, 0, 0]], expected: [1, 0, -1] },
      { input: [1, ["free", "alloc", "in_use"], [0, 0, 0]], expected: [null, 0, 1] },
      { input: [3, ["alloc", "free", "free", "alloc"], [0, 2, 2, 0]], expected: [2, null, null, 2] },
    ],
    hint: "A LIFO free list returns the most recently freed block first.",
  },
  {
    id: "ds-267",
    title: "Cache Set Index Bits",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Split a physical address into cache tag, set index, and block offset.\n\nblock_size is the cache line size and num_sets is the number of sets. The offset is the address modulo block_size, the set index is the block number modulo num_sets, and the tag is the block number divided by num_sets.\n\nReturn [tag, set_index, offset].",
    starterCode: `def cache_split(address, block_size, num_sets):
    # Your code here
    pass`,
    solution: `def cache_split(address, block_size, num_sets):
    offset = address % block_size
    set_index = (address // block_size) % num_sets
    tag = address // (block_size * num_sets)
    return [tag, set_index, offset]`,
    testCases: [
      { input: [0, 4, 2], expected: [0, 0, 0] },
      { input: [5, 4, 2], expected: [0, 1, 1] },
      { input: [100, 8, 4], expected: [3, 0, 4] },
      { input: [37, 16, 8], expected: [0, 2, 5] },
    ],
    hint: "The tag counts how many complete set-groups precede the address.",
  },
  {
    id: "ds-268",
    title: "Cache Tag Compare",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Check whether an address hits in a set-associative cache.\n\ncache is a list of sets, each holding recently used tags for that set. block_size and num_sets define the address split; the address hits when its tag is present in the indexed set.\n\nReturn [hit, tag].",
    starterCode: `def cache_tag_compare(cache, block_size, num_sets, address):
    # Your code here
    pass`,
    solution: `def cache_tag_compare(cache, block_size, num_sets, address):
    set_index = (address // block_size) % num_sets
    tag = address // (block_size * num_sets)
    return [tag in cache[set_index], tag]`,
    testCases: [
      { input: [[[1, 2], [3]], 4, 2, 8], expected: [true, 1] },
      { input: [[[1, 2], [3]], 4, 2, 4], expected: [false, 0] },
      { input: [[[], []], 4, 2, 0], expected: [false, 0] },
      { input: [[[5], [5]], 4, 2, 20], expected: [false, 2] },
    ],
    hint: "Only the tags stored in the selected set are compared.",
  },
  {
    id: "ds-269",
    title: "Clock Hand Advance",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Advance a clock replacement hand around a circular buffer of frames.\n\nnum_frames is the frame count, start is the current hand position, and steps is the number of advances. Positions wrap modulo the frame count.\n\nReturn the new hand position.",
    starterCode: `def clock_hand_advance(num_frames, start, steps):
    # Your code here
    pass`,
    solution: `def clock_hand_advance(num_frames, start, steps):
    return (start + steps) % num_frames`,
    testCases: [
      { input: [4, 0, 1], expected: 1 },
      { input: [4, 3, 5], expected: 0 },
      { input: [1, 0, 7], expected: 0 },
      { input: [4, 0, 0], expected: 0 },
    ],
    hint: "The hand position is just a sum taken modulo the frame count.",
  },
  {
    id: "ds-270",
    title: "Page Table Walk Levels",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Compute how many page-table levels are needed for an address space.\n\nvirtual_bits is the width of a virtual address, offset_bits is the page-offset width, and entry_bits is how many address bits each table level translates. Each level covers entry_bits bits and the top level covers whatever remains.\n\nReturn the number of levels needed (0 when the offset already covers the address).",
    starterCode: `def page_table_levels(virtual_bits, offset_bits, entry_bits):
    # Your code here
    pass`,
    solution: `def page_table_levels(virtual_bits, offset_bits, entry_bits):
    remaining = virtual_bits - offset_bits
    if remaining <= 0:
        return 0
    return (remaining + entry_bits - 1) // entry_bits`,
    testCases: [
      { input: [32, 12, 10], expected: 2 },
      { input: [48, 12, 9], expected: 4 },
      { input: [32, 12, 20], expected: 1 },
      { input: [32, 32, 10], expected: 0 },
    ],
    hint: "Round the remaining virtual bits up to a whole number of table levels.",
  },
  {
    id: "ds-271",
    title: "TLB Entry Eviction Pick",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Pick the least recently used TLB entry for eviction.\n\nentries is a list of [page, last_used_tick] pairs. Choose the entry with the smallest last-used tick, breaking ties by the smallest page number.\n\nReturn the page to evict, or None when the TLB is empty.",
    starterCode: `def tlb_evict_pick(entries):
    # Your code here
    pass`,
    solution: `def tlb_evict_pick(entries):
    if not entries:
        return None
    return min(entries, key=lambda e: (e[1], e[0]))[0]`,
    testCases: [
      { input: [[[1, 5], [2, 3], [3, 3]]], expected: 2 },
      { input: [[[9, 0]]], expected: 9 },
      { input: [[]], expected: null },
      { input: [[[4, 7], [2, 7], [3, 1]]], expected: 3 },
    ],
    hint: "Ties in recency are broken deterministically by the page number.",
  },
  {
    id: "ds-272",
    title: "Lock-Free Ring Buffer Reserve/Commit",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate reserve and commit on a lock-free ring buffer.\n\ncapacity is the number of slots. operations contains \"reserve\" (values[i] is stored at the next free slot and the reservation succeeds only while outstanding reservations fit), \"commit\" (make the oldest reservation visible to consumers), or \"consume\" (record the oldest committed value, or None).\n\nReturn the list of recorded results (None for commit).",
    starterCode: `def ring_reserve_commit(capacity, operations, values):
    # Your code here
    pass`,
    solution: `def ring_reserve_commit(capacity, operations, values):
    slots = [None] * capacity
    produce = 0
    committed = 0
    consume = 0
    pending = 0
    out = []
    for op, val in zip(operations, values):
        if op == "reserve":
            if produce - consume < capacity:
                slots[produce % capacity] = val
                produce += 1
                pending += 1
                out.append(True)
            else:
                out.append(False)
        elif op == "commit":
            if pending > 0:
                pending -= 1
                committed += 1
            out.append(None)
        else:
            if consume < committed:
                out.append(slots[consume % capacity])
                consume += 1
            else:
                out.append(None)
    return out`,
    testCases: [
      {
        input: [2, ["reserve", "commit", "reserve", "commit", "consume", "consume"], [7, 0, 8, 0, 0, 0]],
        expected: [true, null, true, null, 7, 8],
      },
      { input: [1, ["reserve", "reserve", "commit", "consume"], [5, 6, 0, 0]], expected: [true, false, null, 5] },
      { input: [1, ["consume"], [0]], expected: [null] },
      {
        input: [2, ["reserve", "commit", "reserve", "consume", "consume"], [1, 0, 2, 0, 0]],
        expected: [true, null, true, 1, null],
      },
    ],
    hint: "A consumer can only see slots whose reservations have been committed.",
  },
  {
    id: "ds-273",
    title: "Seqlock Read Retry",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Count read retries in a seqlock with a pending writer.\n\noperations contains \"begin_write\" (values[i] is the new value and the sequence becomes odd), \"end_write\" (publish the value and make the sequence even), or \"read\". A read that overlaps an in-progress write must retry once before observing the last committed value.\n\nReturn [last_read_value, retry_count].",
    starterCode: `def seqlock_read_retries(operations, values):
    # Your code here
    pass`,
    solution: `def seqlock_read_retries(operations, values):
    seq = 0
    committed = None
    pending = None
    retries = 0
    out = []
    for op, val in zip(operations, values):
        if op == "begin_write":
            seq += 1
            pending = val
        elif op == "end_write":
            committed = pending
            pending = None
            seq += 1
        else:
            if pending is not None:
                retries += 1
            out.append(committed)
    return [out[-1] if out else None, retries]`,
    testCases: [
      { input: [["begin_write", "read", "end_write", "read"], [7, 0, 0, 0]], expected: [7, 1] },
      { input: [["begin_write", "end_write", "read"], [5, 0, 0]], expected: [5, 0] },
      { input: [["read"], [0]], expected: [null, 0] },
      { input: [["begin_write", "read", "read", "end_write", "read"], [1, 0, 0, 0, 0]], expected: [1, 2] },
    ],
    hint: "An odd sequence number means a writer is mid-update, so the reader retries.",
  },
  {
    id: "ds-274",
    title: "Hazard Pointer Retire Count",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Count how many retired nodes a hazard-pointer scheme can free.\n\nhazards is a list of per-thread hazard pages (None entries are ignored) and retires is a list of [node_id, page] pairs. A retired node is deferred while any thread holds its page as a hazard, and is freed otherwise.\n\nReturn [freed_count, deferred_count].",
    starterCode: `def hazard_retire_count(hazards, retires):
    # Your code here
    pass`,
    solution: `def hazard_retire_count(hazards, retires):
    hazard_set = set()
    for thread in hazards:
        for page in thread:
            if page is not None:
                hazard_set.add(page)
    freed = 0
    deferred = 0
    for node, page in retires:
        if page in hazard_set:
            deferred += 1
        else:
            freed += 1
    return [freed, deferred]`,
    testCases: [
      { input: [[[1, null], [2, null]], [[10, 1], [11, 1], [12, 2], [13, 3]]], expected: [1, 3] },
      { input: [[[null]], [[1, 5]]], expected: [1, 0] },
      { input: [[[7]], [[1, 7], [2, 7]]], expected: [0, 2] },
      { input: [[[], []], []], expected: [0, 0] },
    ],
    hint: "Any thread holding the page as a hazard defers reclamation of that node.",
  },
  {
    id: "ds-275",
    title: "RCU Grace Period Mock",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate RCU grace periods.\n\noperations contains \"read_lock\" and \"read_unlock\" (values[i] is the thread id) or \"synchronize\". A synchronize at a given moment must wait for every reader that is active then, so record how many readers are blocking it (0 when it completes immediately).\n\nReturn the list of blocking counts.",
    starterCode: `def rcu_grace_period(operations, values):
    # Your code here
    pass`,
    solution: `def rcu_grace_period(operations, values):
    active = {}
    out = []
    for op, val in zip(operations, values):
        if op == "read_lock":
            active[val] = active.get(val, 0) + 1
        elif op == "read_unlock":
            if active.get(val, 0) > 0:
                active[val] -= 1
        else:
            out.append(sum(active.values()))
    return out`,
    testCases: [
      { input: [["read_lock", "read_lock", "synchronize", "read_unlock", "synchronize"], [1, 2, 0, 1, 0]], expected: [2, 1] },
      { input: [["synchronize"], [0]], expected: [0] },
      { input: [["read_lock", "read_unlock", "synchronize"], [1, 1, 0]], expected: [0] },
      { input: [["read_lock", "synchronize", "read_unlock", "synchronize"], [3, 0, 3, 0]], expected: [1, 0] },
    ],
    hint: "A grace period lasts only while readers that started before it remain active.",
  },
  {
    id: "ds-276",
    title: "Epoch-Based Reclamation Counter",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Count reclaimed objects in an epoch-based reclamation scheme.\n\nnum_threads threads pin epochs; all start at epoch 0. Operations are \"retire\" (add an object at the current global epoch), \"advance\" (increment the global epoch), \"pin\" (values[i] is the thread that adopts the global epoch), and \"reclaim\" (free every retired object whose epoch is below the minimum pinned epoch and record how many were freed).\n\nReturn the list of freed counts.",
    starterCode: `def epoch_ops(num_threads, operations, values):
    # Your code here
    pass`,
    solution: `def epoch_ops(num_threads, operations, values):
    thread_epochs = [0] * num_threads
    global_epoch = 0
    retired = []
    out = []
    for op, val in zip(operations, values):
        if op == "retire":
            retired.append(global_epoch)
        elif op == "advance":
            global_epoch += 1
        elif op == "pin":
            thread_epochs[val] = global_epoch
        else:
            limit = min(thread_epochs) if thread_epochs else 0
            keep = []
            freed = 0
            for e in retired:
                if e < limit:
                    freed += 1
                else:
                    keep.append(e)
            retired = keep
            out.append(freed)
    return out`,
    testCases: [
      { input: [1, ["retire", "advance", "pin", "reclaim"], [0, 0, 0, 0]], expected: [1] },
      { input: [1, ["retire", "reclaim"], [0, 0]], expected: [0] },
      {
        input: [2, ["retire", "advance", "pin", "retire", "advance", "pin", "reclaim"], [0, 0, 0, 0, 0, 1, 0]],
        expected: [1],
      },
      { input: [1, ["retire", "advance", "advance", "pin", "reclaim", "reclaim"], [0, 0, 0, 0, 0, 0]], expected: [1, 0] },
    ],
    hint: "Objects retire at the global epoch and are reclaimable once every pinned epoch has passed.",
  },
  {
    id: "ds-277",
    title: "LRU vs LFU Hit Count Comparison",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Compare LRU and LFU hit counts on the same page reference string.\n\npages is the reference sequence and capacity is the number of frames. LRU evicts the least recently used page; LFU evicts the least frequently used page, breaking ties by least recent use.\n\nReturn [lru_hits, lfu_hits].",
    starterCode: `def lru_vs_lfu(pages, capacity):
    # Your code here
    pass`,
    solution: `def lru_vs_lfu(pages, capacity):
    lru_frames = []
    lru_hits = 0
    for p in pages:
        if p in lru_frames:
            lru_hits += 1
            lru_frames.remove(p)
            lru_frames.append(p)
        else:
            if len(lru_frames) >= capacity:
                lru_frames.pop(0)
            lru_frames.append(p)
    freq = {}
    lfu_frames = []
    lfu_hits = 0
    tick = 0
    last = {}
    for p in pages:
        tick += 1
        if p in lfu_frames:
            lfu_hits += 1
            freq[p] += 1
            last[p] = tick
        else:
            if len(lfu_frames) >= capacity:
                victim = min(lfu_frames, key=lambda f: (freq[f], last[f]))
                lfu_frames.remove(victim)
                del freq[victim]
                del last[victim]
            lfu_frames.append(p)
            freq[p] = 1
            last[p] = tick
    return [lru_hits, lfu_hits]`,
    testCases: [
      { input: [[1, 2, 3, 1, 2, 4, 1, 2], 3], expected: [4, 4] },
      { input: [[1, 1], 1], expected: [1, 1] },
      { input: [[1, 2, 1], 1], expected: [0, 0] },
      { input: [[7], 1], expected: [0, 0] },
    ],
    hint: "LFU ties are broken by recency so the eviction choice stays deterministic.",
  },
  {
    id: "ds-278",
    title: "Write Buffer Coalescing",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Coalesce buffered writes to measure how many were merged.\n\nwrites is a list of [start, end) byte ranges. Ranges that overlap or touch merge into one; after merging, report how many input writes disappeared into merges and the total covered bytes.\n\nReturn [coalesced_count, total_bytes].",
    starterCode: `def coalesce_writes(writes):
    # Your code here
    pass`,
    solution: `def coalesce_writes(writes):
    if not writes:
        return [0, 0]
    ordered = sorted(writes, key=lambda w: (w[0], w[1]))
    merged = 0
    total = 0
    cur_lo, cur_hi = ordered[0]
    for lo, hi in ordered[1:]:
        if lo <= cur_hi:
            merged += 1
            if hi > cur_hi:
                cur_hi = hi
        else:
            total += cur_hi - cur_lo
            cur_lo, cur_hi = lo, hi
    total += cur_hi - cur_lo
    return [merged, total]`,
    testCases: [
      { input: [[[0, 4], [4, 8], [10, 12]]], expected: [1, 10] },
      { input: [[]], expected: [0, 0] },
      { input: [[[5, 6]]], expected: [0, 1] },
      { input: [[[1, 3], [2, 5], [7, 9], [8, 10]]], expected: [2, 7] },
    ],
    hint: "Touching ranges where the next start equals the current end also merge.",
  },
  {
    id: "ds-279",
    title: "Read-Your-Writes Queue",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate read-your-writes consistency for a session.\n\noperations contains \"write\" (keys[i] = values[i], buffered), \"flush\" (publish buffered writes to the store), or \"read\" (record the buffered value for keys[i] if present, else the stored value or None).\n\nReturn the list of recorded results (None for write and flush).",
    starterCode: `def ryw_queue(operations, keys, values):
    # Your code here
    pass`,
    solution: `def ryw_queue(operations, keys, values):
    pending = {}
    store = {}
    out = []
    for op, key, val in zip(operations, keys, values):
        if op == "write":
            pending[key] = val
            out.append(None)
        elif op == "flush":
            store.update(pending)
            pending = {}
            out.append(None)
        else:
            if key in pending:
                out.append(pending[key])
            else:
                out.append(store.get(key))
    return out`,
    testCases: [
      {
        input: [["write", "read", "flush", "write", "read"], ["a", "a", "", "a", "a"], [1, 0, 0, 2, 0]],
        expected: [null, 1, null, null, 2],
      },
      { input: [["read"], ["x"], [0]], expected: [null] },
      { input: [["write", "flush", "read"], ["k", "", "k"], [5, 0, 0]], expected: [null, null, 5] },
      {
        input: [["write", "write", "read", "flush", "read"], ["k", "k", "k", "", "k"], [1, 2, 0, 0, 0]],
        expected: [null, null, 2, null, 2],
      },
    ],
    hint: "A session's buffered writes shadow the committed store until flushed.",
  },
  {
    id: "ds-280",
    title: "LSM Level Capacity",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Compute the file capacities of leveled LSM-tree levels.\n\nbase is the capacity of level 0 and each subsequent level multiplies the previous capacity by ratio.\n\nReturn the capacities for num_levels levels, starting at base.",
    starterCode: `def lsm_level_capacities(base, ratio, num_levels):
    # Your code here
    pass`,
    solution: `def lsm_level_capacities(base, ratio, num_levels):
    return [base * (ratio ** i) for i in range(num_levels)]`,
    testCases: [
      { input: [2, 2, 4], expected: [2, 4, 8, 16] },
      { input: [1, 10, 3], expected: [1, 10, 100] },
      { input: [5, 1, 3], expected: [5, 5, 5] },
      { input: [0, 2, 3], expected: [0, 0, 0] },
    ],
    hint: "Each level's capacity is the previous level's capacity times the growth ratio.",
  },
  {
    id: "ds-281",
    title: "SSTable Binary Search Steps",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Count the comparisons binary search needs on a sorted SSTable index.\n\nsorted_keys is the sorted index key list and target is the lookup key. Simulate the standard halving loop and count each comparison.\n\nReturn [comparisons, index]; the index is -1 when the key is absent.",
    starterCode: `def sstable_search_steps(sorted_keys, target):
    # Your code here
    pass`,
    solution: `def sstable_search_steps(sorted_keys, target):
    lo = 0
    hi = len(sorted_keys) - 1
    steps = 0
    while lo <= hi:
        steps += 1
        mid = (lo + hi) // 2
        if sorted_keys[mid] == target:
            return [steps, mid]
        if sorted_keys[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return [steps, -1]`,
    testCases: [
      { input: [[1, 3, 5, 7, 9], 5], expected: [1, 2] },
      { input: [[1, 3, 5, 7], 4], expected: [2, -1] },
      { input: [[], 1], expected: [0, -1] },
      { input: [[7], 7], expected: [1, 0] },
    ],
    hint: "Count a comparison even when the probe misses.",
  },
  {
    id: "ds-282",
    title: "Bloom Bits per Key",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Compute the optimal Bloom filter size in bits per key.\n\nFor a target false positive rate p, the optimal number of bits per key is -ln(p) / (ln 2)^2, which minimizes the false positive probability for a given memory budget. Rates outside the open interval (0, 1) return 0.0.\n\nReturn the bits per key as a float.",
    starterCode: `def bloom_bits_per_key(false_positive_rate):
    # Your code here
    pass`,
    solution: `import math


def bloom_bits_per_key(false_positive_rate):
    if false_positive_rate <= 0 or false_positive_rate >= 1:
        return 0.0
    return -math.log(false_positive_rate) / (math.log(2) ** 2)`,
    testCases: [
      { input: [0.01], expected: 9.585058377367439 },
      { input: [0.1], expected: 4.792529188683719 },
      { input: [0.5], expected: 1.4426950408889634 },
      { input: [1.0], expected: 0.0 },
    ],
    hint: "The constant 1 / (ln 2)^2 is approximately 2.08 bits per key per nat of ln(1/p).",
  },
  {
    id: "ds-283",
    title: "Checkpoint Frequency Calc",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Count WAL checkpoints for a size threshold.\n\nwal_bytes is the total log volume and interval_bytes is the checkpoint interval. A checkpoint triggers every interval_bytes, with a final partial interval still counting.\n\nReturn the number of checkpoints (0 for a non-positive interval).",
    starterCode: `def checkpoint_count(wal_bytes, interval_bytes):
    # Your code here
    pass`,
    solution: `def checkpoint_count(wal_bytes, interval_bytes):
    if interval_bytes <= 0:
        return 0
    return (wal_bytes + interval_bytes - 1) // interval_bytes`,
    testCases: [
      { input: [1000, 400], expected: 3 },
      { input: [400, 400], expected: 1 },
      { input: [0, 400], expected: 0 },
      { input: [401, 400], expected: 2 },
    ],
    hint: "This is a ceiling division of the log volume by the interval.",
  },
  {
    id: "ds-284",
    title: "B+ Tree Internal Key Bounds",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Compute the legal key-count range for a B+ tree internal node.\n\norder is the maximum number of children. An internal node has between ceil(order/2) and order children, so it stores one fewer key than children at each bound.\n\nReturn [min_keys, max_keys].",
    starterCode: `def btree_key_bounds(order):
    # Your code here
    pass`,
    solution: `def btree_key_bounds(order):
    return [(order + 1) // 2 - 1, order - 1]`,
    testCases: [
      { input: [3], expected: [1, 2] },
      { input: [4], expected: [1, 3] },
      { input: [5], expected: [2, 4] },
      { input: [1], expected: [0, 0] },
    ],
    hint: "The minimum child count is half the order rounded up.",
  },
  {
    id: "ds-285",
    title: "Leveled Compaction Score",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Compute leveled compaction scores for an LSM tree.\n\nThe score of a level is its file count divided by its capacity; levels over 1.0 are candidates for compaction. levels and capacities are parallel lists.\n\nReturn the list of scores as floats.",
    starterCode: `def compaction_scores(levels, capacities):
    # Your code here
    pass`,
    solution: `def compaction_scores(levels, capacities):
    return [levels[i] / capacities[i] for i in range(len(levels))]`,
    testCases: [
      { input: [[4, 2, 0], [2, 4, 8]], expected: [2.0, 0.5, 0.0] },
      { input: [[3, 5], [3, 10]], expected: [1.0, 0.5] },
      { input: [[0, 0], [1, 1]], expected: [0.0, 0.0] },
      { input: [[10, 1], [2, 100]], expected: [5.0, 0.01] },
    ],
    hint: "A score above one means the level has more files than its target capacity.",
  },
  {
    id: "ds-286",
    title: "Tombstone Purge Trigger",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Decide which tombstones can be purged.\n\nentries is a list of [key, value, timestamp] and oldest_snapshot is the oldest live snapshot timestamp. Tombstone entries (value None) with a timestamp at or before oldest_snapshot can be purged; later tombstones must stay.\n\nReturn [remaining_tombstones, purged_tombstones].",
    starterCode: `def purge_tombstones(entries, oldest_snapshot):
    # Your code here
    pass`,
    solution: `def purge_tombstones(entries, oldest_snapshot):
    remaining = 0
    purged = 0
    for key, value, ts in entries:
        if value is None:
            if ts <= oldest_snapshot:
                purged += 1
            else:
                remaining += 1
    return [remaining, purged]`,
    testCases: [
      { input: [[[1, null, 5], [2, "a", 7], [3, null, 10]], 5], expected: [1, 1] },
      { input: [[[1, null, 3]], 5], expected: [0, 1] },
      { input: [[[1, "a", 1]], 5], expected: [0, 0] },
      { input: [[], 5], expected: [0, 0] },
    ],
    hint: "Purging is only safe once no live snapshot can still see the deleted value.",
  },
  {
    id: "ds-287",
    title: "Cuckoo Hashing Kick-Out Chain",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate cuckoo hashing kick-out chains across two tables.\n\ncapacity is the size of each table. Table 0 uses key % capacity and table 1 uses (key // capacity) % capacity. Keys are inserted in order; an occupied slot evicts its occupant to the other table, and an insertion fails if the chain exceeds twice the capacity.\n\nReturn [failure_count, table0, table1].",
    starterCode: `def cuckoo_insert(capacity, keys):
    # Your code here
    pass`,
    solution: `def cuckoo_insert(capacity, keys):
    t0 = [None] * capacity
    t1 = [None] * capacity
    failures = 0
    for key in keys:
        cur = key
        table = 0
        for _ in range(2 * capacity):
            slot = cur % capacity if table == 0 else (cur // capacity) % capacity
            if table == 0:
                if t0[slot] is None:
                    t0[slot] = cur
                    cur = None
                    break
                t0[slot], cur = cur, t0[slot]
            else:
                if t1[slot] is None:
                    t1[slot] = cur
                    cur = None
                    break
                t1[slot], cur = cur, t1[slot]
            table ^= 1
        if cur is not None:
            failures += 1
    return [failures, t0, t1]`,
    testCases: [
      { input: [3, [0, 3, 6]], expected: [0, [6, null, null], [0, 3, null]] },
      { input: [2, [1, 3, 5]], expected: [0, [null, 5], [1, 3]] },
      { input: [3, [1, 2, 3]], expected: [0, [3, 1, 2], [null, null, null]] },
      { input: [2, []], expected: [0, [null, null], [null, null]] },
      { input: [1, [0, 1, 2, 3]], expected: [2, [3], [2]] },
    ],
    hint: "Alternating tables on every kick spreads each key across its two candidate slots.",
  },
  {
    id: "ds-288",
    title: "Robin Hood Hashing Probe Distance",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Insert keys with Robin Hood hashing and report probe distances.\n\ncapacity is the table size and keys are inserted in order at key % capacity. A key whose probe distance exceeds the resident's distance steals the slot, pushing the richer resident onward.\n\nReturn [max_probe_distance, final_table_keys].",
    starterCode: `def robin_hood(capacity, keys):
    # Your code here
    pass`,
    solution: `def robin_hood(capacity, keys):
    table = [None] * capacity
    max_dist = 0
    for key in keys:
        cur = (key, 0)
        idx = key % capacity
        while True:
            if table[idx] is None:
                table[idx] = cur
                if cur[1] > max_dist:
                    max_dist = cur[1]
                break
            if table[idx][1] < cur[1]:
                table[idx], cur = cur, table[idx]
            idx = (idx + 1) % capacity
            cur = (cur[0], cur[1] + 1)
    return [max_dist, [e[0] if e else None for e in table]]`,
    testCases: [
      { input: [3, [0, 3, 6]], expected: [2, [0, 3, 6]] },
      { input: [4, [1, 5, 9, 2]], expected: [2, [2, 1, 5, 9]] },
      { input: [2, []], expected: [0, [null, null]] },
      { input: [2, [0, 1]], expected: [0, [0, 1]] },
    ],
    hint: "Stealing from richer residents equalizes probe lengths across the table.",
  },
  {
    id: "ds-289",
    title: "CRDT PN-Counter Merge",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Merge two PN-Counters from different replicas.\n\nA PN-counter tracks positive and negative increments separately, and merging takes the element-wise maximum of both sides. a and b are dictionaries with \"pos\" and \"neg\" totals.\n\nReturn [merged_pos, merged_neg, merged_value].",
    starterCode: `def pn_counter_merge(a, b):
    # Your code here
    pass`,
    solution: `def pn_counter_merge(a, b):
    pos = max(a["pos"], b["pos"])
    neg = max(a["neg"], b["neg"])
    return [pos, neg, pos - neg]`,
    testCases: [
      { input: [{ "pos": 3, "neg": 1 }, { "pos": 2, "neg": 4 }], expected: [3, 4, -1] },
      { input: [{ "pos": 0, "neg": 0 }, { "pos": 5, "neg": 2 }], expected: [5, 2, 3] },
      { input: [{ "pos": 2, "neg": 2 }, { "pos": 2, "neg": 2 }], expected: [2, 2, 0] },
      { input: [{ "pos": 7, "neg": 0 }, { "pos": 1, "neg": 1 }], expected: [7, 1, 6] },
    ],
    hint: "Taking the maximum of each component makes the merge idempotent and commutative.",
  },
  {
    id: "ds-290",
    title: "LWW Map Merge",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Merge two last-write-wins maps.\n\nEach map stores key to [value, timestamp]. For every key the entry with the larger timestamp wins, and ties keep the value from a. Keys are strings.\n\nReturn the merged map.",
    starterCode: `def lww_merge(a, b):
    # Your code here
    pass`,
    solution: `def lww_merge(a, b):
    merged = {}
    for key, entry in a.items():
        merged[key] = list(entry)
    for key, entry in b.items():
        if key not in merged or entry[1] > merged[key][1]:
            merged[key] = list(entry)
    return merged`,
    testCases: [
      {
        input: [{ "x": ["a", 1], "y": ["b", 3] }, { "x": ["c", 2], "z": ["d", 1] }],
        expected: { x: ["c", 2], y: ["b", 3], z: ["d", 1] },
      },
      { input: [{}, { "k": ["v", 1] }], expected: { k: ["v", 1] } },
      { input: [{ "k": ["a", 5] }, { "k": ["b", 5] }], expected: { k: ["a", 5] } },
      { input: [{}, {}], expected: {} },
    ],
    hint: "On a timestamp tie the first map's value is kept for determinism.",
  },
  {
    id: "ds-291",
    title: "Version Vector Dominates Check",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Check whether one version vector dominates another.\n\na and b are version vectors as lists of integers. a dominates b when every element of a is at least the corresponding element of b, meaning b's history is fully contained in a's. Vectors of different lengths never dominate each other.\n\nReturn True or False.",
    starterCode: `def vv_dominates(a, b):
    # Your code here
    pass`,
    solution: `def vv_dominates(a, b):
    if len(a) != len(b):
        return False
    return all(x >= y for x, y in zip(a, b))`,
    testCases: [
      { input: [[2, 3, 1], [1, 3, 1]], expected: true },
      { input: [[1, 2], [2, 1]], expected: false },
      { input: [[0, 0], [0, 0]], expected: true },
      { input: [[], []], expected: true },
      { input: [[1], [1, 1]], expected: false },
    ],
    hint: "Dominance is component-wise greater than or equal.",
  },
  {
    id: "ds-292",
    title: "OR-Set Add/Remove Check",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate an observed-remove set (OR-Set).\n\noperations contains \"add\" (each add attaches a fresh unique tag and records None), \"remove\" (record None and drop all tags observed for the value), \"contains\" (record a boolean), or \"to_list\" (record the sorted values with at least one live tag).\n\nReturn the list of recorded results.",
    starterCode: `def orset_ops(operations, values):
    # Your code here
    pass`,
    solution: `def orset_ops(operations, values):
    adds = {}
    tag_counter = 0
    out = []
    for op, val in zip(operations, values):
        if op == "add":
            tag_counter += 1
            adds.setdefault(val, set()).add(tag_counter)
            out.append(None)
        elif op == "remove":
            adds.pop(val, None)
            out.append(None)
        elif op == "contains":
            out.append(bool(adds.get(val)))
        else:
            out.append(sorted(adds.keys()))
    return out`,
    testCases: [
      {
        input: [["add", "add", "remove", "contains", "add", "contains"], [1, 2, 1, 1, 1, 1]],
        expected: [null, null, null, false, null, true],
      },
      { input: [["contains"], [9]], expected: [false] },
      { input: [["add", "add", "add", "to_list"], [2, 1, 2, 0]], expected: [null, null, null, [1, 2]] },
      {
        input: [["add", "remove", "to_list", "add", "to_list"], [5, 5, 0, 5, 0]],
        expected: [null, null, [], null, [5]],
      },
    ],
    hint: "A re-add after remove creates a brand new tag, so the value becomes visible again.",
  },
  {
    id: "ds-293",
    title: "Delta CRDT Compression",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Compress a list of CRDT updates to the latest version per key.\n\nupdates is a list of [key, value, version]. Keep only the update with the largest version for each key.\n\nReturn [key, value, version] triples sorted by key.",
    starterCode: `def delta_compress(updates):
    # Your code here
    pass`,
    solution: `def delta_compress(updates):
    best = {}
    for key, value, version in updates:
        if key not in best or version > best[key][1]:
            best[key] = (value, version)
    return [[key, best[key][0], best[key][1]] for key in sorted(best)]`,
    testCases: [
      { input: [[["a", 1, 1], ["b", 2, 1], ["a", 3, 2]]], expected: [["a", 3, 2], ["b", 2, 1]] },
      { input: [[]], expected: [] },
      { input: [[["x", 5, 7]]], expected: [["x", 5, 7]] },
      { input: [[["k", 1, 2], ["k", 1, 1]]], expected: [["k", 1, 2]] },
    ],
    hint: "Version numbers give a total order per key, so the maximum version wins.",
  },
  {
    id: "ds-294",
    title: "Causal Broadcast Deliver Check",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Check whether a broadcast message can be delivered under causal order.\n\nlocal_clock is the current version vector and message is [sender, vector]. A message from sender is deliverable when its vector count for sender is exactly local_clock[sender] + 1 and every other component is at most the local count, meaning all dependencies arrived first.\n\nReturn True or False.",
    starterCode: `def causal_check(local_clock, message):
    # Your code here
    pass`,
    solution: `def causal_check(local_clock, message):
    sender, vv = message
    if vv[sender] != local_clock[sender] + 1:
        return False
    for j in range(len(local_clock)):
        if j != sender and vv[j] > local_clock[j]:
            return False
    return True`,
    testCases: [
      { input: [[0, 0, 0], [0, [1, 0, 0]]], expected: true },
      { input: [[1, 0, 0], [0, [1, 0, 0]]], expected: false },
      { input: [[0, 0, 0], [1, [0, 1, 0]]], expected: true },
      { input: [[0, 0, 0], [0, [2, 0, 0]]], expected: false },
      { input: [[0, 1, 0], [2, [0, 1, 1]]], expected: true },
    ],
    hint: "The sender's own counter must advance by exactly one, and all other counts must already be known.",
  },
  {
    id: "ds-295",
    title: "Interval Max Overlap Point",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Find the point covered by the most intervals.\n\nintervals is a list of half-open [start, end) ranges. Sweep the endpoints, processing starts before ends at the same coordinate.\n\nReturn [point, max_count], choosing the smallest point on ties (and [None, 0] when there are no intervals).",
    starterCode: `def max_overlap(intervals):
    # Your code here
    pass`,
    solution: `def max_overlap(intervals):
    events = []
    for lo, hi in intervals:
        events.append((lo, 1))
        events.append((hi, -1))
    events.sort(key=lambda e: (e[0], -e[1]))
    current = 0
    best = 0
    best_point = None
    for point, delta in events:
        current += delta
        if current > best:
            best = current
            best_point = point
    return [best_point, best]`,
    testCases: [
      { input: [[[1, 4], [2, 5], [3, 6]]], expected: [3, 3] },
      { input: [[[1, 2], [2, 3]]], expected: [2, 2] },
      { input: [[]], expected: [null, 0] },
      { input: [[[5, 10], [1, 3], [2, 4]]], expected: [2, 2] },
    ],
    hint: "Sorting starts ahead of ends at the same coordinate handles touching intervals correctly.",
  },
  {
    id: "ds-296",
    title: "Segment Tree Min/Max Lazy Add",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Support range addition and min/max queries with a segment tree.\n\nnums is the initial array. queries is a list of [\"add\", l, r, val] or [\"query\", l, r] (returns [minimum, maximum]). A lazy value per node defers additions to children until they are needed.\n\nReturn the list of query results.",
    starterCode: `def lazy_min_max(nums, queries):
    # Your code here
    pass`,
    solution: `def lazy_min_max(nums, queries):
    n = len(nums)
    tmin = [0] * (4 * n) if n else []
    tmax = [0] * (4 * n) if n else []
    lazy = [0] * (4 * n) if n else []

    def build(node, lo, hi):
        if lo == hi:
            tmin[node] = tmax[node] = nums[lo]
            return
        mid = (lo + hi) // 2
        build(2 * node + 1, lo, mid)
        build(2 * node + 2, mid + 1, hi)
        tmin[node] = min(tmin[2 * node + 1], tmin[2 * node + 2])
        tmax[node] = max(tmax[2 * node + 1], tmax[2 * node + 2])

    if n:
        build(0, 0, n - 1)

    def apply(node, val):
        tmin[node] += val
        tmax[node] += val
        lazy[node] += val

    def push(node):
        if lazy[node]:
            apply(2 * node + 1, lazy[node])
            apply(2 * node + 2, lazy[node])
            lazy[node] = 0

    def add(node, lo, hi, l, r, val):
        if r < lo or hi < l:
            return
        if l <= lo and hi <= r:
            apply(node, val)
            return
        push(node)
        mid = (lo + hi) // 2
        add(2 * node + 1, lo, mid, l, r, val)
        add(2 * node + 2, mid + 1, hi, l, r, val)
        tmin[node] = min(tmin[2 * node + 1], tmin[2 * node + 2])
        tmax[node] = max(tmax[2 * node + 1], tmax[2 * node + 2])

    def query(node, lo, hi, l, r):
        if r < lo or hi < l:
            return (float("inf"), float("-inf"))
        if l <= lo and hi <= r:
            return (tmin[node], tmax[node])
        push(node)
        mid = (lo + hi) // 2
        a = query(2 * node + 1, lo, mid, l, r)
        b = query(2 * node + 2, mid + 1, hi, l, r)
        return (min(a[0], b[0]), max(a[1], b[1]))

    out = []
    for q in queries:
        if q[0] == "query":
            res = query(0, 0, n - 1, q[1], q[2])
            out.append([res[0], res[1]])
        else:
            add(0, 0, n - 1, q[1], q[2], q[3])
    return out`,
    testCases: [
      {
        input: [[1, 2, 3, 4], [["add", 0, 2, 5], ["query", 0, 3], ["query", 1, 2]]],
        expected: [[4, 8], [7, 8]],
      },
      { input: [[5], [["query", 0, 0], ["add", 0, 0, -3], ["query", 0, 0]]], expected: [[5, 5], [2, 2]] },
      { input: [[0, 0, 0], [["add", 1, 2, 7], ["query", 0, 2]]], expected: [[0, 7]] },
      {
        input: [[1, 2, 3, 4], [["add", 0, 3, 1], ["add", 1, 1, -10], ["query", 0, 3]]],
        expected: [[-7, 5]],
      },
      { input: [[], []], expected: [] },
    ],
    hint: "Adding a constant to a whole segment shifts its minimum and maximum by the same amount.",
  },
  {
    id: "ds-297",
    title: "Wavelet Matrix Rank",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Answer value-occurrence queries with a wavelet matrix.\n\nnums holds small non-negative values (up to 4 bits) and queries is a list of [\"count\", l, r, x] asking how many times x appears in nums[l..r] inclusive. The wavelet matrix routes values through stable bit partitions so each query costs O(bits).\n\nReturn the counts in query order.",
    starterCode: `def wavelet_rank(nums, queries):
    # Your code here
    pass`,
    solution: `def wavelet_rank(nums, queries):
    bits = 4
    levels = []
    cur = list(nums)
    for b in range(bits - 1, -1, -1):
        prefix = [0] * (len(cur) + 1)
        zeros = []
        ones = []
        for i, x in enumerate(cur):
            if (x >> b) & 1:
                prefix[i + 1] = prefix[i] + 1
                ones.append(x)
            else:
                prefix[i + 1] = prefix[i]
                zeros.append(x)
        levels.append((prefix, len(zeros)))
        cur = zeros + ones
    order = list(range(bits - 1, -1, -1))

    def count_less(l, r, x):
        res = 0
        for level, b in enumerate(order):
            prefix, z = levels[level]
            ones_l = prefix[l]
            ones_r = prefix[r]
            zeros_l = l - ones_l
            zeros_r = r - ones_r
            if (x >> b) & 1:
                res += zeros_r - zeros_l
                l = z + ones_l
                r = z + ones_r
            else:
                l = zeros_l
                r = zeros_r
        return res

    out = []
    for q in queries:
        l, r, x = q[1], q[2], q[3]
        out.append(count_less(l, r + 1, x + 1) - count_less(l, r + 1, x))
    return out`,
    testCases: [
      { input: [[1, 4, 2, 4, 3], [["count", 0, 4, 4]]], expected: [2] },
      { input: [[1, 4, 2, 4, 3], [["count", 1, 3, 4]]], expected: [2] },
      { input: [[0, 0, 0], [["count", 0, 2, 0]]], expected: [3] },
      { input: [[], []], expected: [] },
    ],
    hint: "Counting values below x plus one minus values below x isolates the occurrences of x.",
  },
  {
    id: "ds-298",
    title: "Sqrt Decomposition with Lazy Blocks",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Support range addition and range sums with square-root decomposition and lazy blocks.\n\nnums is the initial array. queries is a list of [\"add\", l, r, val] or [\"query\", l, r] (inclusive sum). Partial blocks are updated elementwise while whole blocks carry a lazy offset.\n\nReturn the list of query results.",
    starterCode: `def sqrt_lazy_range_add(nums, queries):
    # Your code here
    pass`,
    solution: `import math


def sqrt_lazy_range_add(nums, queries):
    n = len(nums)
    if n == 0:
        return []
    block = math.isqrt(n) + 1
    nb = (n + block - 1) // block
    blocksum = [0] * nb
    lazy = [0] * nb
    for i, x in enumerate(nums):
        blocksum[i // block] += x

    def rebuild(b):
        lo = b * block
        hi = min(n, lo + block)
        blocksum[b] = sum(nums[lo:hi])

    out = []
    for q in queries:
        if q[0] == "add":
            l, r, val = q[1], q[2], q[3]
            bl, br = l // block, r // block
            if bl == br:
                for i in range(l, r + 1):
                    nums[i] += val
                rebuild(bl)
            else:
                for i in range(l, (bl + 1) * block):
                    nums[i] += val
                rebuild(bl)
                for i in range(br * block, r + 1):
                    nums[i] += val
                rebuild(br)
                for b in range(bl + 1, br):
                    lazy[b] += val
        else:
            l, r = q[1], q[2]
            bl, br = l // block, r // block
            total = 0
            if bl == br:
                for i in range(l, r + 1):
                    total += nums[i] + lazy[bl]
            else:
                for i in range(l, (bl + 1) * block):
                    total += nums[i] + lazy[bl]
                for i in range(br * block, r + 1):
                    total += nums[i] + lazy[br]
                for b in range(bl + 1, br):
                    hi = min(n, (b + 1) * block)
                    total += blocksum[b] + lazy[b] * (hi - b * block)
            out.append(total)
    return out`,
    testCases: [
      {
        input: [
          [1, 2, 3, 4, 5],
          [["add", 0, 4, 1], ["query", 0, 4], ["add", 1, 2, 10], ["query", 1, 3]],
        ],
        expected: [20, 32],
      },
      { input: [[5], [["query", 0, 0], ["add", 0, 0, -2], ["query", 0, 0]]], expected: [5, 3] },
      { input: [[], []], expected: [] },
      { input: [[0, 0, 0], [["add", 0, 2, 7], ["query", 0, 2]]], expected: [21] },
      {
        input: [[1, 2, 3, 4], [["add", 1, 1, 10], ["query", 0, 3], ["query", 1, 1]]],
        expected: [20, 12],
      },
    ],
    hint: "A partial block needs its elements updated, but a fully covered block only bumps its lazy offset.",
  },
  {
    id: "ds-299",
    title: "DSU Rollback Snapshot",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Simulate a union-find with rollback snapshots.\n\noperations contains [\"union\", a, b] (record True when merged), [\"find\", x] (record the root), [\"snapshot\"] (record the snapshot id), or [\"rollback\"] (restore the most recent snapshot and record True or False). No path compression is used, so every union can be undone through a history stack.\n\nReturn the list of recorded results.",
    starterCode: `def dsu_rollback_ops(n, operations):
    # Your code here
    pass`,
    solution: `def dsu_rollback_ops(n, operations):
    parent = list(range(n))
    size = [1] * n
    history = []
    snapshots = []
    out = []

    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x

    for op in operations:
        if op[0] == "union":
            a = find(op[1])
            b = find(op[2])
            if a == b:
                out.append(False)
            else:
                if size[a] < size[b]:
                    a, b = b, a
                history.append((b, parent[b], size[a]))
                parent[b] = a
                size[a] += size[b]
                out.append(True)
        elif op[0] == "find":
            out.append(find(op[1]))
        elif op[0] == "snapshot":
            snapshots.append(len(history))
            out.append(len(snapshots) - 1)
        else:
            if snapshots:
                target = snapshots.pop()
                while len(history) > target:
                    child, old_parent, old_size = history.pop()
                    parent[child] = old_parent
                    size[parent[child]] = old_size
                out.append(True)
            else:
                out.append(False)
    return out`,
    testCases: [
      {
        input: [3, [["union", 0, 1], ["snapshot"], ["union", 1, 2], ["find", 2], ["rollback"], ["find", 2]]],
        expected: [true, 0, true, 0, true, 2],
      },
      { input: [2, [["rollback"]]], expected: [false] },
      { input: [2, [["union", 0, 1], ["rollback"], ["find", 1]]], expected: [true, false, 0] },
      {
        input: [4, [["union", 0, 1], ["snapshot"], ["union", 2, 3], ["rollback"], ["find", 3]]],
        expected: [true, 0, true, true, 3],
      },
    ],
    hint: "Without path compression, each parent change is a single history entry that can be reverted.",
  },
  {
    id: "ds-300",
    title: "DSU Persistent Parent Versions",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Simulate a persistent union-find whose parent arrays are versioned.\n\noperations contains [\"union\", version, a, b] (creates a new version and records its id), [\"find\", version, x] (records the root), or [\"parents\", version] (records the parent array). Union by size is used and old versions never change.\n\nReturn the list of recorded results.",
    starterCode: `def dsu_versions(n, operations):
    # Your code here
    pass`,
    solution: `def dsu_versions(n, operations):
    versions = [list(range(n))]
    sizes = [[1] * n]
    out = []

    def find(par, x):
        while par[x] != x:
            x = par[x]
        return x

    for op in operations:
        if op[0] == "union":
            vid = op[1]
            par = list(versions[vid])
            sz = list(sizes[vid])
            a = find(par, op[2])
            b = find(par, op[3])
            if a != b:
                if sz[a] < sz[b]:
                    a, b = b, a
                par[b] = a
                sz[a] += sz[b]
            versions.append(par)
            sizes.append(sz)
            out.append(len(versions) - 1)
        elif op[0] == "find":
            out.append(find(versions[op[1]], op[2]))
        else:
            out.append(list(versions[op[1]]))
    return out`,
    testCases: [
      {
        input: [
          3,
          [
            ["union", 0, 0, 1],
            ["union", 1, 1, 2],
            ["find", 2, 2],
            ["find", 1, 2],
            ["parents", 2],
          ],
        ],
        expected: [1, 2, 0, 2, [0, 0, 0]],
      },
      { input: [1, [["parents", 0]]], expected: [[0]] },
      {
        input: [2, [["union", 0, 0, 1], ["parents", 0], ["parents", 1]]],
        expected: [1, [0, 1], [0, 0]],
      },
      { input: [2, [["find", 0, 1]]], expected: [1] },
    ],
    hint: "Copying the referenced version before mutating keeps every older version immutable.",
  },
  {
    id: "ds-301",
    title: "Heavy-Light Decomposition Head Selection",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Compute heavy-light decomposition heads for a rooted tree.\n\nparents[i] is the parent of node i (-1 for the root). Subtree sizes determine each node's heavy child: the largest child subtree, with ties going to the smallest index. A light child starts a new chain, while a heavy child inherits its parent's head.\n\nReturn [node, heavy_child, head] triples for every node in index order.",
    starterCode: `def hld_heads(parents):
    # Your code here
    pass`,
    solution: `def hld_heads(parents):
    n = len(parents)
    children = [[] for _ in range(n)]
    root = 0
    for i, p in enumerate(parents):
        if p == -1:
            root = i
        else:
            children[p].append(i)
    order = []
    stack = [root]
    while stack:
        u = stack.pop()
        order.append(u)
        for v in children[u]:
            stack.append(v)
    size = [1] * n
    heavy = [-1] * n
    for u in reversed(order):
        best = -1
        best_size = 0
        for v in children[u]:
            size[u] += size[v]
            if size[v] > best_size or (size[v] == best_size and (best == -1 or v < best)):
                best_size = size[v]
                best = v
        heavy[u] = best
    head = [-1] * n
    head[root] = root
    for u in order:
        for v in children[u]:
            head[v] = head[u] if v == heavy[u] else v
    return [[i, heavy[i], head[i]] for i in range(n)]`,
    testCases: [
      {
        input: [[-1, 0, 0, 1, 1, 2]],
        expected: [
          [0, 1, 0],
          [1, 3, 0],
          [2, 5, 2],
          [3, -1, 0],
          [4, -1, 4],
          [5, -1, 2],
        ],
      },
      { input: [[-1]], expected: [[0, -1, 0]] },
      { input: [[-1, 0]], expected: [[0, 1, 0], [1, -1, 0]] },
      {
        input: [[-1, 0, 1]],
        expected: [
          [0, 1, 0],
          [1, 2, 0],
          [2, -1, 0],
        ],
      },
    ],
    hint: "Every light edge starts a new chain and heavy edges continue the parent's chain.",
  },
  {
    id: "ds-302",
    title: "Centroid Decomposition Pick",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Find the centroid of a tree given by a parent array.\n\nparents[i] is the parent of node i (-1 for the root). The centroid minimizes the largest remaining component when removed; ties go to the smallest index.\n\nReturn the centroid node.",
    starterCode: `def find_centroid(parents):
    # Your code here
    pass`,
    solution: `def find_centroid(parents):
    n = len(parents)
    children = [[] for _ in range(n)]
    root = 0
    for i, p in enumerate(parents):
        if p == -1:
            root = i
        else:
            children[p].append(i)
    order = []
    stack = [root]
    while stack:
        u = stack.pop()
        order.append(u)
        for v in children[u]:
            stack.append(v)
    size = [1] * n
    for u in reversed(order):
        for v in children[u]:
            size[u] += size[v]
    best = None
    best_score = None
    for u in range(n):
        largest = n - size[u]
        for v in children[u]:
            if size[v] > largest:
                largest = size[v]
        if best_score is None or largest < best_score or (largest == best_score and u < best):
            best_score = largest
            best = u
    return best`,
    testCases: [
      { input: [[-1, 0, 1, 2, 3]], expected: 2 },
      { input: [[-1, 0, 0, 0, 0]], expected: 0 },
      { input: [[-1, 0]], expected: 0 },
      { input: [[-1]], expected: 0 },
      { input: [[-1, 0, 0, 1, 1, 2]], expected: 0 },
    ],
    hint: "The centroid's largest component is at most half the tree, and it is unique up to ties.",
  },
  {
    id: "ds-303",
    title: "Dominator Tree Immediate Dominator",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Compute immediate dominators for a small directed graph.\n\nn is the node count, edges is a list of [from, to], and start is the entry node. The immediate dominator of a node is the last node through which every path from start must pass. Use the iterative Cooper algorithm with preorder numbers.\n\nReturn the idom array, where the start maps to itself and unreachable nodes map to -1.",
    starterCode: `def immediate_dominators(n, edges, start):
    # Your code here
    pass`,
    solution: `def immediate_dominators(n, edges, start):
    preds = [[] for _ in range(n)]
    succ = [[] for _ in range(n)]
    for u, v in edges:
        preds[v].append(u)
        succ[u].append(v)
    order = {}
    counter = [0]
    stack = [(start, False)]
    visited = set()
    while stack:
        u, processed = stack.pop()
        if processed:
            continue
        if u in visited:
            continue
        visited.add(u)
        order[u] = counter[0]
        counter[0] += 1
        stack.append((u, True))
        for v in reversed(succ[u]):
            if v not in visited:
                stack.append((v, False))
    idom = [-1] * n
    if start in visited:
        idom[start] = start
    changed = True
    while changed:
        changed = False
        for v in sorted(order, key=lambda x: order[x]):
            if v == start:
                continue
            new = None
            for p in preds[v]:
                if idom[p] == -1:
                    continue
                if new is None:
                    new = p
                else:
                    a, b = new, p
                    while a != b:
                        while order[a] > order[b]:
                            a = idom[a]
                        while order[b] > order[a]:
                            b = idom[b]
                    new = a
            if new is not None and idom[v] != new:
                idom[v] = new
                changed = True
    return idom`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [0, 2], [2, 3]], 0], expected: [0, 0, 0, 2] },
      { input: [3, [[0, 1], [1, 2]], 0], expected: [0, 0, 1] },
      { input: [4, [[0, 1], [2, 3]], 0], expected: [0, 0, -1, -1] },
      { input: [1, [], 0], expected: [0] },
    ],
    hint: "Intersect dominator candidates by walking the one with the larger preorder number upward.",
  },
  {
    id: "ds-304",
    title: "KLL Sketch Compaction",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Compact a KLL-style quantile sketch summary.\n\nvalues are inserted as [value, weight] pairs with weight 1 and kept sorted. While the summary is longer than capacity, adjacent pairs are merged with weight doubled and the value replaced by the larger of the two; a trailing odd item is kept unchanged.\n\nReturn the compacted [value, weight] pairs.",
    starterCode: `def kll_compaction(values, capacity):
    # Your code here
    pass`,
    solution: `def kll_compaction(values, capacity):
    summary = [[v, 1] for v in sorted(values)]
    while len(summary) > capacity:
        compacted = []
        i = 0
        while i < len(summary):
            if i + 1 < len(summary):
                v = max(summary[i][0], summary[i + 1][0])
                compacted.append([v, summary[i][1] + summary[i + 1][1]])
                i += 2
            else:
                compacted.append(summary[i])
                i += 1
        summary = compacted
    return summary`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6], 3], expected: [[2, 2], [4, 2], [6, 2]] },
      { input: [[1], 3], expected: [[1, 1]] },
      { input: [[], 2], expected: [] },
      { input: [[5, 4, 3, 2], 1], expected: [[5, 4]] },
      { input: [[3, 1, 2], 2], expected: [[2, 2], [3, 1]] },
    ],
    hint: "Each compaction pass halves the summary length while doubling the weights it carries.",
  },
  {
    id: "ds-305",
    title: "Union by Size Depth",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simulate union by size and measure the resulting tree depth.\n\nunions is a list of [a, b] pairs merged with union by size. Afterwards compute the maximum depth of any node to its root and the number of components.\n\nReturn [max_depth, components].",
    starterCode: `def union_size_depth(n, unions):
    # Your code here
    pass`,
    solution: `def union_size_depth(n, unions):
    parent = list(range(n))
    size = [1] * n

    def find(x):
        d = 0
        while parent[x] != x:
            x = parent[x]
            d += 1
        return x, d

    for a, b in unions:
        ra, _ = find(a)
        rb, _ = find(b)
        if ra != rb:
            if size[ra] < size[rb]:
                ra, rb = rb, ra
            parent[rb] = ra
            size[ra] += size[rb]
    max_depth = 0
    roots = set()
    for i in range(n):
        r, d = find(i)
        roots.add(r)
        if d > max_depth:
            max_depth = d
    return [max_depth, len(roots)]`,
    testCases: [
      { input: [4, [[0, 1], [2, 3], [0, 2]]], expected: [2, 1] },
      { input: [3, []], expected: [0, 3] },
      { input: [2, [[0, 1]]], expected: [1, 1] },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], expected: [1, 1] },
    ],
    hint: "Attaching the smaller root under the larger keeps every tree shallow.",
  },
  {
    id: "ds-306",
    title: "Tumbling Window Aggregate",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Aggregate a stream into tumbling windows.\n\nsizes is the sequence of values and window is the number of items per window; the final window may be partial.\n\nReturn the list of window sums.",
    starterCode: `def tumbling_window(sizes, window):
    # Your code here
    pass`,
    solution: `def tumbling_window(sizes, window):
    out = []
    for i in range(0, len(sizes), window):
        out.append(sum(sizes[i:i + window]))
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 2], expected: [3, 7, 5] },
      { input: [[], 2], expected: [] },
      { input: [[1], 3], expected: [1] },
      { input: [[1, 2, 3, 4], 4], expected: [10] },
    ],
    hint: "Windows never overlap, so slice the input in strides.",
  },
  {
    id: "ds-307",
    title: "Top-K Exact vs Approximate Check",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Check whether an approximate top-k result matches the exact one.\n\nitems is the full observation list, approximate is a claimed top-k collection, and k is the requested size. The exact result orders by count descending and then value ascending.\n\nReturn True when the two sets match, otherwise False.",
    starterCode: `def topk_check(items, approximate, k):
    # Your code here
    pass`,
    solution: `def topk_check(items, approximate, k):
    counts = {}
    for x in items:
        counts[x] = counts.get(x, 0) + 1
    exact = sorted(counts, key=lambda x: (-counts[x], x))[:k]
    return sorted(exact) == sorted(approximate)`,
    testCases: [
      { input: [["a", "b", "a", "c", "a", "b"], ["a", "b"], 2], expected: true },
      { input: [["a", "b", "a", "c", "a", "b"], ["a", "c"], 2], expected: false },
      { input: [[], [], 1], expected: true },
      { input: [["x"], ["y"], 1], expected: false },
    ],
    hint: "Both lists are sorted before comparison so order within the approximation does not matter.",
  },
  {
    id: "ds-308",
    title: "Set Union with Bitset",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "List the set members of the union of two bitsets.\n\na and b are non-negative integers used as bitsets. Return the sorted positions of the set bits in a | b.",
    starterCode: `def bitset_union_members(a, b):
    # Your code here
    pass`,
    solution: `def bitset_union_members(a, b):
    u = a | b
    out = []
    i = 0
    while u:
        if u & 1:
            out.append(i)
        u >>= 1
        i += 1
    return out`,
    testCases: [
      { input: [5, 3], expected: [0, 1, 2] },
      { input: [0, 0], expected: [] },
      { input: [255, 1], expected: [0, 1, 2, 3, 4, 5, 6, 7] },
      { input: [10, 12], expected: [1, 2, 3] },
    ],
    hint: "Shift the union right one bit at a time and record the positions where the low bit is set.",
  },
  {
    id: "ds-309",
    title: "Batch Processing Window Count",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Count the batches needed to process records.\n\nrecord_count records are processed in batches of batch_size; the final batch may be partial. A non-positive batch size processes nothing and returns 0.\n\nReturn the number of batches.",
    starterCode: `def batch_count(record_count, batch_size):
    # Your code here
    pass`,
    solution: `def batch_count(record_count, batch_size):
    if batch_size <= 0:
        return 0
    return (record_count + batch_size - 1) // batch_size`,
    testCases: [
      { input: [10, 3], expected: 4 },
      { input: [9, 3], expected: 3 },
      { input: [0, 5], expected: 0 },
      { input: [1, 10], expected: 1 },
      { input: [5, 0], expected: 0 },
    ],
    hint: "Ceiling division handles the partial final batch.",
  },
  {
    id: "ds-310",
    title: "HyperLogLog Merge",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Merge two HyperLogLog register arrays.\n\nRegister arrays cover the same buckets, and merging keeps the maximum observed rank per bucket. Also compute the raw estimator alpha * m^2 / sum(2^-register) with alpha = 0.7213 / (1 + 1.079/m), falling back to linear counting when the result is small and empty registers remain.\n\nReturn [merged_registers, estimate].",
    starterCode: `def hll_merge(a, b):
    # Your code here
    pass`,
    solution: `import math


def hll_merge(a, b):
    merged = [max(x, y) for x, y in zip(a, b)]
    m = len(merged)
    if m == 0:
        return [merged, 0.0]
    alpha = 0.7213 / (1 + 1.079 / m)
    raw = alpha * m * m / sum(2.0 ** (-x) for x in merged)
    zeros = merged.count(0)
    if zeros > 0 and raw <= 2.5 * m:
        return [merged, m * math.log(m / zeros)]
    return [merged, raw]`,
    testCases: [
      { input: [[1, 2, 0], [0, 3, 2]], expected: [[1, 3, 2], 5.456547473120163] },
      { input: [[], []], expected: [[], 0.0] },
      { input: [[5], [1]], expected: [[5], 11.102260702260704] },
      { input: [[1, 1], [1, 1]], expected: [[1, 1], 1.8741149723936346] },
    ],
    hint: "The estimator combines every register through the harmonic mean of 2^-register.",
  },
];
