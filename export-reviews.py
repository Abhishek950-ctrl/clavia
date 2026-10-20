"""Optional, not needed to run Clavia: run from inside the Jev project.
Exports Jev's saved reviews as static data for Clavia's request page.
Read only: nothing is written back into jev/. The deep analysis that Jev
streams is filled in here with its own stand-in (agent._mock's logic),
minus the network re-check of each draft."""
import json, sys, copy
sys.path.insert(0, '.')
import app, agent, playbook as pbk

PICK = {            # review id -> key in Clavia, display name
    'cc076940': ('acme-msa',   'Acme redline – MSA v3'),
    'a8421a05': ('acme-sow',   'Acme – Implementation SOW (customer redline)'),
    '389fcd13': ('birch-nda',  'Birch Labs – Mutual NDA (their paper)'),
    '075db40f': ('kestrel',    'Kestrel Freight – Supplier Agreement (their paper)'),
    '8709929e': ('harbor-dpa', 'Harbor Retail – DPA (customer redline)'),
}
lower = lambda t: t[0].lower() + t[1:] if t else t

def mock(row, rule, us, them):
    sentences = pbk.split_sentences(row['text'])
    quote = row.get('their_text') or (sentences[0] if sentences else '')
    before = (row.get('before') or {}).get('position')
    Them = them[0].upper() + them[1:]
    if row['status'] == 'unacceptable':
        issue = row.get('issue') or 'a term the playbook lists as not acceptable'
        summary = f"This clause crosses our walk-away line: {lower(issue).rstrip('.')}."
        if before and before != 'Unacceptable':
            summary += f" {Them}'s edit moved it from {before.lower()}, so it needs pushing back before signature."
        else:
            summary += " We shouldn't sign it as written."
    else:
        summary = ('This clause gives up more than our starting position but stays within the fallback we can accept. '
                   'We can agree to it, or ask for our starting position first.')
    points = []
    if quote: points.append({'text': 'The term at issue is in this sentence.', 'quote': quote})
    points.append({'text': f"Our starting position: {lower(rule['preferred'])}", 'quote': ''})
    if rule.get('fallback'): points.append({'text': f"The most we can concede: {lower(rule['fallback'])}", 'quote': ''})
    options = []
    for key, label, s, draft in (('starting', 'Starting position', 'Brings the clause back to our starting position.', rule.get('preferred_language') or rule['preferred']),
                                 ('fallback', 'Fallback', 'Concedes to our fallback, the most we accept.', rule.get('fallback_language') or rule.get('fallback') or '')):
        if not draft: continue
        text = pbk.match_quotes(row['text'], draft.strip())
        if not text or text == row['text'].strip(): continue
        options.append({'key': key, 'label': label, 'summary': s, 'text': text,
                        'segments': pbk.suggest_segments(row['text'], text), 'lands': 'Preferred' if key == 'starting' else 'Acceptable fallback'})
    return {'n': row['n'], 'summary': summary, 'reasoning': points[:3], 'options': options, 'mock': True}

out = {}
for aid, (key, name) in PICK.items():
    a = copy.deepcopy(app.get_a(aid))
    app.analyses[aid] = a
    pub = app.public(aid)
    pb = a['playbook']
    by_topic = {c['topic']: c for c in pb['clauses']}
    deep = dict(pub.get('deep') or {})
    us, them = pb.get('party', 'Lumen'), pb.get('counterparty', 'the other party')
    for r in a['result']['clauses']:
        if r['status'] in ('unacceptable', 'fallback') and r.get('topic') in by_topic and r.get('text') and str(r['n']) not in deep:
            deep[str(r['n'])] = mock(r, by_topic[r['topic']], us, them)
    pub.update({'id': key, 'name': name, 'deep': deep, 'deep_pending': [], 'work': {}, 'round': None,
                'rounds': [{'id': key, 'n': 1, 'name': name}], 'claude': False})
    # tailored drafts need a model; leave them out
    for c in pub['clauses'] + pub['missing']:
        c['suggestions'] = [s for s in c.get('suggestions', []) if not s.get('lazy') and s.get('key') != 'tailored']
    pub['rules'] = [{k: r.get(k) for k in ('topic', 'preferred', 'walkaway', 'fallback', 'preferred_language', 'fallback_language')} for r in pb['clauses']]
    out[key] = pub
    print(key, '|', name, '| clauses', len(pub['clauses']), 'missing', len(pub['missing']), 'deep', len(deep), '| starters', pub['starters'], file=sys.stderr)

js = ('/* Contract reviews for the Requests page — exported from the Jev experiment\n'
      '   (Experiments/jev/data/reviews) by scratchpad/export_reviews.py. One per\n'
      '   request that has a contract: its clauses as they stand, where each lands\n'
      '   against the playbook, the reasoning, and the redlines that can be applied. */\n'
      'const JV_REVIEWS = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
import os
# written next to this script, so it works wherever the folder is
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src', 'reviews-data.js'), 'w').write(js)
print(len(js), 'bytes', file=sys.stderr)
